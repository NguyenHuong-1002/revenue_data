import { v4 as uuidv4 } from 'uuid';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { AccountEntity } from 'src/entities/account.entity';
import { Repository } from 'typeorm';
import { NotificationService } from '../notifications/notification.service';
import { CreateAccountDto } from './DTO/create-account.dto';
import { GetAccountsAllDto } from './DTO/getAccountsAll.dto';
import { LoginAccountDto } from './DTO/login-account.dto';
import { UpdateAccountDto } from './DTO/update-account.dto';
import {
  AccountResponse,
  IAccount,
  ILoginResponse,
  IPaginatedAccounts,
  IRegisterResponse,
} from './interfaces/account.interface';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    // eslint-disable-next-line prettier/prettier
  ) { }

  /**
   * Lấy danh sách toàn bộ tài khoản trong hệ thống có phân trang và sắp xếp tăng dần theo ID
   * @param filters DTO chứa thông tin phân trang bao gồm số trang (page) và giới hạn bản ghi (limit)
   * @returns Object phân trang gồm mảng dữ liệu tài khoản và thông tin Meta dữ liệu (tổng số bản ghi, tổng số trang)
   */
  async getUsersAll(filters: GetAccountsAllDto): Promise<IPaginatedAccounts> {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    const [accounts, total] = await this.accountRepository.findAndCount({
      order: {
        account_id: 'ASC',
      },
      skip,
      take: limit,
    });

    return {
      data: accounts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /*
   * Lấy thông tin chi tiết một tài khoản bằng Khóa chính(ID)
   * @param id Chuỗi định danh UUID của tài khoản cần tìm
   * @returns Trả về Object thông tin tài khoản nếu tìm thấy
   * @throws NotFoundException Nếu ID tài khoản không tồn tại trong Database
   */
  async getAccountById(id: string): Promise<IAccount> {
    const account = await this.accountRepository.findOneBy({ account_id: id });
    if (!account) {
      throw new NotFoundException(`Account with ID '` + id + `' not found`);
    }
    return account;
  }

  /**
   * Tạo tài khoản mới từ trang quản trị dành cho Admin/Manager
   * @param dto DTO chứa thông tin tài khoản mới (username, mật khẩu, fullname, vai trò,...)
   * @param adminUsername Tên của Admin thực hiện thao tác (dùng để lưu nhật ký thông báo)
   * @returns Trả về chi tiết thông tin tài khoản vừa được tạo
   * @throws ConflictException Nếu Tên đăng nhập (Username) hoặc Email đã bị trùng lặp trong hệ thống
   */
  async createAccount(
    dto: CreateAccountDto,
    adminUsername?: string,
  ): Promise<AccountResponse> {
    const existing = await this.accountRepository.findOne({
      where: [{ username: dto.username }, { mail: dto.mail }],
    });

    if (existing?.username === dto.username) {
      throw new ConflictException('Username da ton tai');
    }

    if (existing?.mail === dto.mail) {
      throw new ConflictException('Email da ton tai');
    }

    const id = uuidv4();
    const account = this.accountRepository.create({
      account_id: id,
      fullname: dto.fullname,
      username: dto.username,
      passwordHash: this.hashPassword(dto.password),
      mail: dto.mail,
      avatarURL: dto.avatarURL ?? '',
      role: dto.role ?? 'STAFF',
    });

    await this.accountRepository.save(account);

    // Tự động tạo một thông báo hệ thống ghi nhận lịch sử hành động của Admin
    await this.notificationService.createNotification({
      title: 'Tạo tài khoản mới',
      content: `Admin ${adminUsername || 'hệ thống'} đã tạo mới tài khoản ${dto.username} (${dto.fullname}) với vai trò ${dto.role ?? 'STAFF'}.`,
      type: 'SYSTEM',
    });

    return this.getAccountById(id);
  }

  /**
   * Đăng ký tài khoản mới cho người dùng vãng lai ngoài hệ thống (Public Register)
   * @param dto DTO chứa thông tin đăng ký cơ bản
   * @returns Trạng thái đăng ký thành công kèm thông điệp
   * @throws ConflictException Nếu Username hoặc Email đã được đăng ký trước đó
   */
  async register(dto: CreateAccountDto): Promise<IRegisterResponse> {
    const existing = await this.accountRepository.findOne({
      where: [{ username: dto.username }, { mail: dto.mail }],
    });

    if (existing?.username === dto.username) {
      throw new ConflictException('Username da ton tai');
    }

    if (existing?.mail === dto.mail) {
      throw new ConflictException('Email da ton tai');
    }

    const id = uuidv4();
    const account = this.accountRepository.create({
      account_id: id,
      fullname: dto.fullname,
      username: dto.username,
      passwordHash: this.hashPassword(dto.password),
      mail: dto.mail,
      avatarURL: dto.avatarURL ?? '',
      role: 'STAFF',
    });

    await this.accountRepository.save(account);
    return { success: true, message: 'Dang ky thanh cong' };
  }

  /**
   * Xác thực thông tin đăng nhập và tạo mã Access Token (JWT) để cấp quyền truy cập
   * @param dto DTO chứa cặp tài khoản và mật khẩu thô người dùng nhập vào
   * @returns Trả về chuỗi JWT Access Token kèm toàn bộ thông tin cơ bản của User (đã lược bỏ password)
   * @throws UnauthorizedException Nếu tài khoản không đúng hoặc mật khẩu không khớp với hash trong DB
   */
  async login(dto: LoginAccountDto): Promise<ILoginResponse> {
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .addSelect('account.passwordHash')
      .where('account.username = :username', { username: dto.username })
      .getOne();

    if (
      !account ||
      !account.passwordHash ||
      !this.verifyPassword(dto.password, account.passwordHash)
    ) {
      throw new UnauthorizedException('Username hoac password khong dung');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...accountResponse } = account;

    const accessToken = this.jwtService.sign({
      sub: account.account_id,
      username: account.username,
      role: account.role,
    });

    return {
      message: 'Success',
      account: accountResponse,
      accessToken,
      tokenType: 'Bearer',
    };
  }

  /**
   * Cập nhật thông tin tài khoản (Hỗ trợ cơ chế Partial Update - chỉ truyền trường nào sửa trường đó)
   * @param id ID của tài khoản cần sửa đổi thông tin
   * @param dto DTO chứa các thông tin mới muốn thay đổi
   * @param adminUsername Tên của Admin thực hiện thao tác (dùng để lưu nhật ký thông báo)
   * @returns Object tài khoản sau khi đã cập nhật mới dữ liệu thành công
   */
  async updateAccount(
    id: string,
    dto: UpdateAccountDto,
    adminUsername?: string,
  ): Promise<IAccount> {
    const existingAccount = await this.getAccountById(id);
    const updateData: Partial<AccountEntity> = {};
    if (dto.fullname !== undefined) updateData.fullname = dto.fullname;
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.password !== undefined) {
      updateData.passwordHash = this.hashPassword(dto.password);
    }
    if (dto.mail !== undefined) updateData.mail = dto.mail;
    if (dto.avatarURL !== undefined) updateData.avatarURL = dto.avatarURL;
    if (dto.role !== undefined) updateData.role = dto.role;
    await this.accountRepository.update({ account_id: id }, updateData);

    // Tự động tạo thông báo
    await this.notificationService.createNotification({
      title: 'Cập nhật tài khoản',
      content: `Admin ${adminUsername || 'hệ thống'} đã cập nhật thông tin tài khoản ${existingAccount.username} (${existingAccount.fullname}).`,
      type: 'SYSTEM',
    });

    return this.getAccountById(id);
  }

  /**
   * Xóa hoàn toàn một tài khoản ra khỏi cơ sở dữ liệu hệ thống
   * @param id ID tài khoản cần xóa
   * @param adminUsername Tên của Admin thực hiện thao tác (dùng để lưu nhật ký thông báo)
   * @returns `true` nếu xóa thành công bản ghi khỏi DB
   */
  async deleteAccount(id: string, adminUsername?: string): Promise<boolean> {
    const account = await this.getAccountById(id);
    const result = await this.accountRepository.delete({ account_id: id });
    const success = (result.affected ?? 0) > 0;

    if (success) {
      // Tự động tạo thông báo
      await this.notificationService.createNotification({
        title: 'Xóa tài khoản',
        content: `Admin ${adminUsername || 'hệ thống'} đã xóa tài khoản ${account.username} (${account.fullname}) khỏi hệ thống.`,
        type: 'SYSTEM',
      });
    }

    return success;
  }

  /**
   * Hàm nội bộ: Mã hóa mật khẩu bằng thuật toán Scrypt kết hợp chuỗi muối ngẫu nhiên (Salt)
   * Định dạng chuỗi Hash trả về để lưu DB: `scrypt$salt$hash`
   */
  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return 'scrypt$' + salt + '$' + hash;
  }

  /**
   * Hàm nội bộ: Xác thực kiểm tra mật khẩu thô nhập vào xem có trùng khớp với chuỗi mã hóa trong DB không
   * Sử dụng cơ chế `timingSafeEqual` nhằm chống kiểu tấn công dò tìm độ trễ thời gian (Timing Attack)
   */
  private verifyPassword(password: string, passwordHash: string): boolean {
    const [algorithm, salt, storedHash] = passwordHash.split('$');

    if (algorithm !== 'scrypt' || !salt || !storedHash) {
      return password === passwordHash;
    }

    const suppliedHash = scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    return (
      suppliedHash.length === storedHashBuffer.length &&
      timingSafeEqual(suppliedHash, storedHashBuffer)
    );
  }
}
