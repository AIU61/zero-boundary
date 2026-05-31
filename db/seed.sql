insert into users (id, did_hash, display_name, level, energy, contribution, credit)
values ('user-linyan', 'did:lingjie:8d09bd0e5d1d', '林砚', '城市探索者 Lv.1', 12, 8, 91);

insert into merchants (id, name, scene, address, distance_meters, rating, compliance_status)
values
  ('merchant-black-rain', '黑雨冷萃', '独立咖啡', '蓝岸商圈 B1 夜行街 17 号', 320, 4.8, 'approved'),
  ('merchant-neon-roast', '霓虹烘焙所', '精品咖啡', '蓝岸商圈东塔 1F', 580, 4.6, 'approved'),
  ('merchant-late-lab', 'Late Lab 深夜实验室', '夜生活联名', '蓝岸商圈屋顶花园', 760, 4.7, 'pending');

insert into tasks (
  id,
  title,
  subtitle,
  story,
  reward_energy,
  route_name,
  required_merchant_id,
  expires_at,
  status
)
values (
  'task-night-route-001',
  '黑雨冷萃 - 夜行路线',
  '到店试饮并完成真实核销，获得数字票根与隐藏菜单资格。',
  '雨夜里，第一杯冷萃把蓝岸商圈从流量黑箱里拉回真实体验。',
  43,
  '第一条夜行路线',
  'merchant-black-rain',
  now() + interval '7 days',
  'available'
);

insert into task_stops (task_id, merchant_id, title, action, sort_order)
values
  ('task-night-route-001', 'merchant-black-rain', '黑雨冷萃', '扫码核销试饮', 1),
  ('task-night-route-001', 'merchant-neon-roast', '霓虹烘焙所', '解锁二段复购权益', 2);
