'use client';

import { Building2 } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BranchData {
  name: string;
  count: number;
}

interface BranchBreakdownProps {
  branches: BranchData[];
  showAllBranches: boolean;
  setShowAllBranches: (val: boolean) => void;
}

export function BranchBreakdown({
  branches,
  showAllBranches,
  setShowAllBranches,
}: BranchBreakdownProps) {
  const visibleBranches = showAllBranches ? branches : branches.slice(0, 5);
  const maxCount = React.useMemo(() => {
    if (branches.length === 0) return 1;
    return Math.max(...branches.map((b) => b.count), 1);
  }, [branches]);

  return (
    <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          Sản lượng bán theo chi nhánh
        </CardTitle>
        <CardDescription className="text-xs">
          Xếp hạng chi nhánh phân phối được lượng hàng cao nhất
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 px-5">
        {branches.length > 0 ? (
          <div className="space-y-4">
            {visibleBranches.map((branch, index) => {
              const percentage = (branch.count / maxCount) * 100;
              return (
                <div key={branch.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground flex items-center gap-2">
                      <span
                        className={cn(
                          'flex size-5 items-center justify-center rounded-full text-[10px] font-bold',
                          index === 0
                            ? 'bg-amber-500/20 text-amber-500'
                            : index === 1
                              ? 'bg-slate-300/30 text-slate-500'
                              : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {index + 1}
                      </span>
                      Chi nhánh: {branch.name}
                    </span>
                    <span className="text-primary font-bold">{branch.count} sản phẩm</span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {branches.length > 5 && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllBranches(!showAllBranches)}
                  className="text-xs text-primary font-semibold gap-1 hover:bg-primary/5 cursor-pointer"
                >
                  {showAllBranches
                    ? 'Thu gọn'
                    : `Xem tất cả (${branches.length - 5} chi nhánh khác)`}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-xl">
            <span className="text-xs text-muted-foreground">Không có dữ liệu chi nhánh</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
