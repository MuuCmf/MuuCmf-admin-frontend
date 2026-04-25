// 积分规则数据结构
export interface RuleItem {
  table: string;
  field: number | null;
  rule: number;
  cycle: number;
  max: number;
}

// 行为规则数据结构
export interface ActionItem {
  id?: number;
  name: string;
  title: string;
  log: string;
  rule?: RuleItem[];
  module?: string;
  remark?: string;
  status: number;
  update_time?: string;
  create_time?: string;
}
