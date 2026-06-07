import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ChatSession } from '../../entities/chat-session.entity';
import { ChatMessage } from '../../entities/chat-message.entity';
import { DatabaseService } from 'src/models/database.service';
import { RowDataPacket } from 'mysql2';

export type ChatMessagePayload = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,
    private readonly db: DatabaseService,
  ) {}

  // ─── Sessions ────────────────────────────────────────────────────────────────

  async getSessions(): Promise<ChatSession[]> {
    // Pinned first, then by last_accessed_at desc, then by updated_at desc
    return this.sessionRepo
      .createQueryBuilder('s')
      .orderBy('s.isPinned', 'DESC')
      .addOrderBy('COALESCE(s.lastAccessedAt, s.updatedAt)', 'DESC')
      .getMany();
  }

  async createSession(title?: string): Promise<ChatSession> {
    const session = this.sessionRepo.create({
      title: title || 'Cuộc hội thoại mới',
      lastAccessedAt: new Date(),
    });
    return this.sessionRepo.save(session);
  }

  async updateSessionTitle(id: number, title: string): Promise<ChatSession> {
    const session = await this.findSessionOrFail(id);
    session.title = title;
    return this.sessionRepo.save(session);
  }

  async updateSessionDescription(id: number, description: string): Promise<ChatSession> {
    const session = await this.findSessionOrFail(id);
    session.description = description;
    return this.sessionRepo.save(session);
  }

  async togglePin(id: number): Promise<ChatSession> {
    const session = await this.findSessionOrFail(id);
    session.isPinned = !session.isPinned;
    return this.sessionRepo.save(session);
  }

  async touchSession(id: number): Promise<void> {
    await this.sessionRepo.update(id, { lastAccessedAt: new Date() });
  }

  async deleteSession(id: number): Promise<void> {
    const session = await this.findSessionOrFail(id);
    await this.sessionRepo.remove(session);
  }

  async deleteAllSessions(): Promise<{ deleted: number }> {
    const all = await this.sessionRepo.find();
    await this.sessionRepo.remove(all);
    return { deleted: all.length };
  }

  async getMessages(sessionId: number): Promise<ChatMessage[]> {
    await this.findSessionOrFail(sessionId);
    // Touch last accessed
    await this.touchSession(sessionId);
    return this.messageRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async clearMessages(sessionId: number): Promise<void> {
    await this.messageRepo.delete({ sessionId });
  }

  // ─── AI Chat Completion ───────────────────────────────────────────────────────

  async getChatCompletion(
    messages: ChatMessagePayload[],
    sessionId?: number,
  ): Promise<{ role: string; content: string }> {
    const apiKey =
      process.env.OPENROUTER_API_KEY || process.env.API_OPEN_ROUTR || process.env.DEEPSEEK_API_KEY;
    const isOpenRouter = !!(process.env.OPENROUTER_API_KEY || process.env.API_OPEN_ROUTR);

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Missing API Key in environment (OPENROUTER_API_KEY, API_OPEN_ROUTR or DEEPSEEK_API_KEY)',
      );
    }

    const baseUrl = isOpenRouter
      ? 'https://openrouter.ai/api/v1'
      : process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

    const model = isOpenRouter
      ? process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'
      : process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    // Query facts from DB based on the last user message
    const lastUserMsg = messages[messages.length - 1];
    let dbContext = '';
    if (lastUserMsg && lastUserMsg.role === 'user') {
      dbContext = await this.getDatabaseContextForQuery(lastUserMsg.content);
    }

    const systemInstruction: ChatMessagePayload = {
      role: 'system',
      content: [
        'Bạn là trợ lý AI thông minh tích hợp trong hệ thống quản lý doanh thu và dự báo bán hàng.',
        'QUY TẮC BẮT BUỘC:',
        '1. Chỉ sử dụng đúng các số liệu và thông tin thực tế từ cơ sở dữ liệu hệ thống được cung cấp dưới đây để thực hiện phân tích, báo cáo hoặc dự báo. Tuyệt đối KHÔNG tự bịa thêm số liệu, KHÔNG sử dụng tri thức bên ngoài hệ thống về các chỉ số này.',
        '2. Không tự ý suy luận vượt quá dữ kiện được cung cấp. Nếu dữ liệu hệ thống không chứa câu trả lời hoặc không đầy đủ thông tin để trả lời câu hỏi cụ thể, hãy phản hồi rõ ràng và lịch sự cho người dùng biết là chưa có đủ dữ liệu trên hệ thống thay vì tự tạo số liệu.',
        '3. Trả lời bằng tiếng Việt một cách lịch sự, chính xác và chuyên nghiệp, đưa ra các nhận xét và gợi ý chiến lược kinh doanh thực tế bám sát dữ liệu.',
        '',
        '[DỮ LIỆU TỪ DATABASE HỆ THỐNG]:',
        dbContext,
      ].join('\n'),
    };

    const cleanMessages = messages.filter((m) => m.role !== 'system');
    const finalMessages = [systemInstruction, ...cleanMessages];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    if (isOpenRouter) {
      headers['HTTP-Referer'] = 'https://revenue-ai.vn';
      headers['X-Title'] = 'Revenue AI Dashboard';
    }

    // Save user message to DB if sessionId provided
    if (sessionId) {
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg && lastUserMsg.role === 'user') {
        await this.messageRepo.save(
          this.messageRepo.create({
            sessionId,
            role: 'user',
            content: lastUserMsg.content,
          }),
        );
      }
      await this.touchSession(sessionId);
    }

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: finalMessages,
          stream: false,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`AI API error: ${response.status} - ${errorText}`);
        throw new InternalServerErrorException('AI API request failed');
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '';

      // Save assistant reply to DB if sessionId provided
      if (sessionId) {
        await this.messageRepo.save(
          this.messageRepo.create({ sessionId, role: 'assistant', content }),
        );

        // Auto-update session title and description from first user message/response
        const session = await this.sessionRepo.findOne({
          where: { id: sessionId },
        });
        const msgCount = await this.messageRepo.count({ where: { sessionId } });
        if (session && msgCount <= 2) {
          const firstUserMsg = messages.find((m) => m.role === 'user');
          if (firstUserMsg) {
            let changed = false;
            if (session.title === 'Cuộc hội thoại mới') {
              session.title =
                firstUserMsg.content.substring(0, 60) +
                (firstUserMsg.content.length > 60 ? '...' : '');
              changed = true;
            }
            if (!session.description) {
              this.generateBackgroundDescription(sessionId, firstUserMsg.content, content).catch(
                (err) => this.logger.error('Error in background description generation', err),
              );
            }
            if (changed) {
              await this.sessionRepo.save(session);
            }
          }
        }
      }

      return { role: 'assistant', content };
    } catch (error: any) {
      this.logger.error('Error fetching chat completion', error.stack);
      throw new InternalServerErrorException('Failed to generate chat response');
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async findSessionOrFail(id: number): Promise<ChatSession> {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) throw new NotFoundException(`Session #${id} not found`);
    return session;
  }

  private async generateBackgroundDescription(
    sessionId: number,
    userContent: string,
    assistantContent: string,
  ): Promise<void> {
    const apiKey =
      process.env.OPENROUTER_API_KEY || process.env.API_OPEN_ROUTR || process.env.DEEPSEEK_API_KEY;
    const isOpenRouter = !!(process.env.OPENROUTER_API_KEY || process.env.API_OPEN_ROUTR);
    if (!apiKey) return;

    const baseUrl = isOpenRouter
      ? 'https://openrouter.ai/api/v1'
      : process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

    const model = isOpenRouter
      ? process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'
      : process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    const prompt = `Hãy tóm tắt cuộc hội thoại sau thành một mô tả ngắn gọn (tối đa 15 từ, bằng tiếng Việt, viết tự nhiên dạng ghi chú như "Phân tích doanh thu..." hoặc "Tìm hiểu sản phẩm..."). Trả về TRỰC TIẾP câu tóm tắt, không thêm bất kỳ nhãn hay lời mở đầu nào khác.\n\nNgười dùng: ${userContent}\nAI: ${assistantContent}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    if (isOpenRouter) {
      headers['HTTP-Referer'] = 'https://revenue-ai.vn';
      headers['X-Title'] = 'Revenue AI Dashboard';
    }

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          temperature: 0.6,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const description = data.choices?.[0]?.message?.content ?? '';
        if (description) {
          const cleaned = description.trim().replace(/^["']|["']$/g, '');
          await this.sessionRepo.update(sessionId, { description: cleaned });
        }
      }
    } catch (error) {
      this.logger.error('Background description generation failed', error);
    }
  }

  private async getDatabaseContextForQuery(userQuery: string): Promise<string> {
    const queryLower = userQuery.toLowerCase();

    // 1. Phân tích doanh thu chi nhánh
    if (
      queryLower.includes('doanh thu chi nhánh') ||
      queryLower.includes('phân tích chi nhánh') ||
      (queryLower.includes('chi nhánh') && queryLower.includes('doanh thu'))
    ) {
      try {
        const [branchesRevenue] = await this.db.client.query<RowDataPacket[]>(
          `SELECT 
             sb.store_id, 
             sb.name as branch_name, 
             sb.city,
             COALESCE(SUM(sr.sold_quantity * p.listing_price), 0) as total_revenue,
             COALESCE(SUM(sr.sold_quantity), 0) as total_sold_quantity
           FROM storeBranch sb
           LEFT JOIN saleReport sr ON sb.store_id = sr.branch_id
           LEFT JOIN product p ON sr.product_id = p.product_id
           GROUP BY sb.store_id, sb.name, sb.city
           ORDER BY total_revenue DESC`,
        );

        const [monthlyBranchRevenue] = await this.db.client.query<RowDataPacket[]>(
          `SELECT 
             sb.name as branch_name, 
             DATE_FORMAT(sr.time_report, '%Y-%m') as month,
             COALESCE(SUM(sr.sold_quantity * p.listing_price), 0) as monthly_revenue,
             COALESCE(SUM(sr.sold_quantity), 0) as monthly_sold_quantity
           FROM storeBranch sb
           INNER JOIN saleReport sr ON sb.store_id = sr.branch_id
           INNER JOIN product p ON sr.product_id = p.product_id
           GROUP BY sb.store_id, sb.name, month
           ORDER BY month DESC, monthly_revenue DESC
           LIMIT 15`,
        );

        let context = `[DỮ LIỆU DOANH THU CHI NHÁNH TỪ HỆ THỐNG]\n`;
        context += `1. Tổng doanh thu và số lượng bán tích lũy theo chi nhánh:\n`;
        if (branchesRevenue.length === 0) {
          context += `- Chưa có dữ liệu doanh thu chi nhánh.\n`;
        } else {
          branchesRevenue.forEach((b) => {
            context += `- Chi nhánh: ${b.branch_name} (${b.city}), ID: ${b.store_id}, Doanh thu: ${Number(b.total_revenue).toLocaleString('vi-VN')} VNĐ, Số lượng bán: ${b.total_sold_quantity} sản phẩm\n`;
          });
        }

        context += `\n2. Chi tiết doanh thu theo tháng gần đây của các chi nhánh:\n`;
        if (monthlyBranchRevenue.length === 0) {
          context += `- Chưa có dữ liệu theo tháng gần đây.\n`;
        } else {
          monthlyBranchRevenue.forEach((b) => {
            context += `- Chi nhánh: ${b.branch_name}, Tháng: ${b.month}, Doanh thu: ${Number(b.monthly_revenue).toLocaleString('vi-VN')} VNĐ, Số lượng bán: ${b.monthly_sold_quantity} sản phẩm\n`;
          });
        }

        return context;
      } catch (err: any) {
        this.logger.error('Error querying branch revenue data', err.stack);
        return 'Lỗi khi truy xuất dữ liệu doanh thu chi nhánh từ database.';
      }
    }

    // 2. Dự báo tài chính AI / Dự báo doanh thu
    if (
      queryLower.includes('dự báo') ||
      queryLower.includes('xu hướng doanh thu') ||
      queryLower.includes('tài chính ai') ||
      queryLower.includes('dự đoán doanh thu')
    ) {
      try {
        const [historicalRevenue] = await this.db.client.query<RowDataPacket[]>(
          `SELECT 
             DATE_FORMAT(sr.time_report, '%Y-%m') as month,
             COALESCE(SUM(sr.sold_quantity * p.listing_price), 0) as total_revenue,
             COALESCE(SUM(sr.sold_quantity), 0) as total_sold_quantity
           FROM saleReport sr
           INNER JOIN product p ON sr.product_id = p.product_id
           GROUP BY month
           ORDER BY month ASC`,
        );

        let context = `[DỮ LIỆU DOANH THU LỊCH SỬ TỪ HỆ THỐNG ĐỂ DỰ BÁO]\n`;
        context += `Lịch sử doanh thu theo tháng:\n`;
        if (historicalRevenue.length === 0) {
          context += `- Chưa có dữ liệu lịch sử doanh thu.\n`;
        } else {
          historicalRevenue.forEach((r) => {
            context += `- Tháng: ${r.month}, Doanh thu: ${Number(r.total_revenue).toLocaleString('vi-VN')} VNĐ, Số lượng bán: ${r.total_sold_quantity} sản phẩm\n`;
          });
        }

        // Calculate simple trend metrics for AI reference
        if (historicalRevenue.length >= 2) {
          const lastIndex = historicalRevenue.length - 1;
          const current = Number(historicalRevenue[lastIndex].total_revenue);
          const prev = Number(historicalRevenue[lastIndex - 1].total_revenue);
          const diff = current - prev;
          const pct = prev > 0 ? (diff / prev) * 100 : 0;
          context += `\n[TÍNH TOÁN BỔ SUNG ĐỂ DỰ BÁO]\n`;
          context += `- Tăng trưởng tháng gần nhất (${historicalRevenue[lastIndex].month} so với ${historicalRevenue[lastIndex - 1].month}): ${pct > 0 ? '+' : ''}${pct.toFixed(2)}% (${diff.toLocaleString('vi-VN')} VNĐ)\n`;

          // Simple Linear Regression slope prediction
          const n = historicalRevenue.length;
          const xs = Array.from({ length: n }, (_, i) => i + 1);
          const ys = historicalRevenue.map((r) => Number(r.total_revenue));
          const sumX = xs.reduce((a, b) => a + b, 0);
          const sumY = ys.reduce((a, b) => a + b, 0);
          const sumXY = xs.reduce((sum, x, idx) => sum + x * ys[idx], 0);
          const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);
          const denominator = n * sumX2 - sumX * sumX;
          const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
          const intercept = (sumY - slope * sumX) / n;
          const nextMonthVal = intercept + slope * (n + 1);
          context += `- Dự báo hồi quy tuyến tính cho tháng tiếp theo: ${Math.max(0, Math.round(nextMonthVal)).toLocaleString('vi-VN')} VNĐ (Hệ số độ dốc Slope: ${slope.toFixed(2)}, Điểm cắt Intercept: ${intercept.toFixed(2)})\n`;
        }

        return context;
      } catch (err: any) {
        this.logger.error('Error querying forecasting data', err.stack);
        return 'Lỗi khi truy xuất dữ liệu dự báo tài chính từ database.';
      }
    }

    // 3. Sản phẩm bán chạy nhất
    if (
      queryLower.includes('sản phẩm bán chạy') ||
      queryLower.includes('sản phẩm mang lại doanh thu') ||
      queryLower.includes('bán chạy nhất')
    ) {
      try {
        const [topProducts] = await this.db.client.query<RowDataPacket[]>(
          `SELECT 
             p.product_id, 
             p.color as product_name, 
             p.detail_product_group, 
             p.gender, 
             p.size, 
             p.listing_price,
             COALESCE(SUM(sr.sold_quantity), 0) as total_sold_quantity,
             COALESCE(SUM(sr.sold_quantity * p.listing_price), 0) as total_revenue
           FROM product p
           INNER JOIN saleReport sr ON p.product_id = sr.product_id
           GROUP BY p.product_id, p.color, p.detail_product_group, p.gender, p.size, p.listing_price
           ORDER BY total_revenue DESC
           LIMIT 10`,
        );

        let context = `[DỮ LIỆU TOP 10 SẢN PHẨM BÁN CHẠY NHẤT TỪ HỆ THỐNG]\n`;
        if (topProducts.length === 0) {
          context += `- Chưa có dữ liệu sản phẩm bán chạy.\n`;
        } else {
          topProducts.forEach((p, index) => {
            context += `${index + 1}. Mã SP: ${p.product_id}, Màu sắc/Tên: ${p.product_name}, Nhóm chi tiết: ${p.detail_product_group}, Giới tính: ${p.gender}, Size: ${p.size}, Giá niêm yết: ${Number(p.listing_price).toLocaleString('vi-VN')} VNĐ, Đã bán: ${p.total_sold_quantity} chiếc, Tổng doanh thu mang lại: ${Number(p.total_revenue).toLocaleString('vi-VN')} VNĐ\n`;
          });
        }

        return context;
      } catch (err: any) {
        this.logger.error('Error querying top products data', err.stack);
        return 'Lỗi khi truy xuất dữ liệu sản phẩm bán chạy từ database.';
      }
    }

    // 4. Hiệu suất kho hàng
    if (
      queryLower.includes('hiệu suất hoạt động nhà kho') ||
      queryLower.includes('hiệu suất kho') ||
      queryLower.includes('hiệu xuất kho') ||
      queryLower.includes('nhà kho') ||
      queryLower.includes('kho hàng') ||
      queryLower.includes('nhà máy') ||
      queryLower.includes('tồn kho')
    ) {
      try {
        const [plantsInventory] = await this.db.client.query<RowDataPacket[]>(
          `SELECT 
             pl.plant_id,
             pl.name_plant,
             pl.address,
             pl.manager_name,
             pl.phone,
             COALESCE(SUM(ir.quantity), 0) as total_stock,
             COUNT(DISTINCT ir.product_id) as total_unique_products
           FROM Plant pl
           LEFT JOIN InventoryReport ir ON pl.plant_id = ir.plant_id
           GROUP BY pl.plant_id, pl.name_plant, pl.address, pl.manager_name, pl.phone
           ORDER BY total_stock DESC`,
        );

        const [monthlyPlantInventory] = await this.db.client.query<RowDataPacket[]>(
          `SELECT 
             pl.name_plant,
             DATE_FORMAT(ir.calendar_year_week, '%Y-%m') as month,
             COALESCE(SUM(ir.quantity), 0) as stock_quantity
           FROM Plant pl
           INNER JOIN InventoryReport ir ON pl.plant_id = ir.plant_id
           GROUP BY pl.plant_id, pl.name_plant, month
           ORDER BY month DESC, stock_quantity DESC
           LIMIT 15`,
        );

        let context = `[DỮ LIỆU TỒN KHO VÀ HIỆU SUẤT NHÀ KHO TỪ HỆ THỐNG]\n`;
        context += `1. Thông tin tồn kho hiện tại theo nhà kho:\n`;
        if (plantsInventory.length === 0) {
          context += `- Chưa có dữ liệu tồn kho của các nhà kho.\n`;
        } else {
          plantsInventory.forEach((pl) => {
            context += `- Kho: ${pl.name_plant} (ID: ${pl.plant_id}), Địa chỉ: ${pl.address}, Quản lý: ${pl.manager_name} (SĐT: ${pl.phone}), Tổng tồn kho: ${Number(pl.total_stock).toLocaleString('vi-VN')} sản phẩm, Số chủng loại sản phẩm khác biệt: ${pl.total_unique_products}\n`;
          });
        }

        context += `\n2. Biến động lượng tồn kho theo tháng gần đây:\n`;
        if (monthlyPlantInventory.length === 0) {
          context += `- Chưa có dữ liệu biến động tồn kho gần đây.\n`;
        } else {
          monthlyPlantInventory.forEach((m) => {
            context += `- Kho: ${m.name_plant}, Tháng: ${m.month}, Tổng lượng tồn: ${Number(m.stock_quantity).toLocaleString('vi-VN')} sản phẩm\n`;
          });
        }

        return context;
      } catch (err: any) {
        this.logger.error('Error querying inventory performance data', err.stack);
        return 'Lỗi khi truy xuất dữ liệu hiệu suất kho hàng từ database.';
      }
    }

    // Default: General query summary stats
    try {
      const [generalStats] = await this.db.client.query<RowDataPacket[]>(
        `SELECT 
           (SELECT SUM(sr.sold_quantity * p.listing_price) FROM saleReport sr INNER JOIN product p ON sr.product_id = p.product_id) as total_revenue,
           (SELECT COUNT(*) FROM storeBranch) as branch_count,
           (SELECT COUNT(*) FROM product) as product_count,
           (SELECT SUM(quantity) FROM InventoryReport) as total_stock`,
      );

      const stats = generalStats[0];
      return `[THÔNG TIN TỔNG QUAN HỆ THỐNG TỪ DATABASE]\n- Tổng doanh thu hệ thống: ${Number(stats?.total_revenue ?? 0).toLocaleString('vi-VN')} VNĐ\n- Số lượng chi nhánh: ${stats?.branch_count ?? 0}\n- Số lượng mặt hàng sản phẩm: ${stats?.product_count ?? 0}\n- Tổng tồn kho hiện tại: ${Number(stats?.total_stock ?? 0).toLocaleString('vi-VN')} sản phẩm\n`;
    } catch {
      return '';
    }
  }
}
