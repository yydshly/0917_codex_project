// Independently written, single-connection teaching model; not the upstream collector.
export const scenarios = {
  normal: { title: '连续增长与重复快照', frames: [10, 13, 13, 18], notes: ['初次观察到连接，计入当前累计值。', '只增加上次之后产生的 3 MB。', '相同累计值再次出现，没有新增流量。', '累计值继续增长，本轮新增 5 MB。'] },
  reset: { title: '计数回退与重置', frames: [10, 13, 1, 4], notes: ['初次观察到连接，计入当前累计值。', '连接持续增长，本轮新增 3 MB。', '累计值从 13 回到 1，按重置处理，新增 1 MB 并重新计连接。', '使用重置后的新基线，本轮新增 3 MB。'] },
  idle: { title: '零流量连接与空闲', frames: [0, 0, 3, 3], notes: ['初见连接但字节为零，暂不计有流量连接。', '仍然没有流量，保持基线。', '首次出现流量，新增 3 MB，连接计数加一。', '空闲时刷新基线，不增加流量或连接数。'] }
};
export function initialState() { return { baseline: null, counted: false, stored: 0, pending: 0, connections: 0, current: null, previous: null, delta: 0, reset: false }; }
export function ingest(state, current) {
  if (!Number.isFinite(current) || current < 0) throw new RangeError('Cumulative value must be finite and nonnegative');
  const reset = state.baseline !== null && current < state.baseline;
  const delta = state.baseline === null || reset ? current : current - state.baseline;
  const counted = reset ? false : state.counted;
  const addedConnection = delta > 0 && !counted ? 1 : 0;
  return { ...state, baseline: current, previous: state.baseline, current, delta, reset, pending: state.pending + delta, counted: counted || delta > 0, connections: state.connections + addedConnection };
}
export function flush(state) { return { ...state, stored: state.stored + state.pending, pending: 0 }; }
export function total(state) { return state.stored + state.pending; }
