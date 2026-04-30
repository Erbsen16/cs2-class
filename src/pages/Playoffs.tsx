import { useMemo, useState } from 'react';
import { generateSwissPlayoffs, generateGSLPlayoffs } from '../engine/tournament';
import SingleElimBracket from '../components/SingleElimBracket';
import RulePanel, { Tip, Badge } from '../components/RulePanel';

type Mode = 'swiss' | 'gsl';

export default function Playoffs() {
  const [mode, setMode] = useState<Mode>('swiss');

  const data = useMemo(() => {
    try {
      if (mode === 'swiss') {
        const d = generateSwissPlayoffs();
        return { ...d, groupWinners: null };
      }
      return generateGSLPlayoffs();
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [mode]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 64px' }} className="page-enter">
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8, marginBottom: 6, color: '#1d1d1f' }}>
          单败淘汰
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 440, marginBottom: 20 }}>
          Single Elimination — 前序阶段不同，进入季后赛的队伍数量和种子排位也不同。切换下方按钮对比。
        </p>

        {/* Toggle */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(0,0,0,0.04)',
          borderRadius: 12,
          padding: 4,
          gap: 2,
        }}>
          <button
            onClick={() => setMode('swiss')}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13,
              fontWeight: mode === 'swiss' ? 600 : 440,
              color: mode === 'swiss' ? '#fff' : 'var(--text-secondary)',
              background: mode === 'swiss' ? 'var(--accent)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            前阶段：瑞士轮 → 8 队
          </button>
          <button
            onClick={() => setMode('gsl')}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13,
              fontWeight: mode === 'gsl' ? 600 : 440,
              color: mode === 'gsl' ? '#fff' : 'var(--text-secondary)',
              background: mode === 'gsl' ? 'var(--accent)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            前阶段：GSL 双败 → 6 队
          </button>
        </div>
      </div>

      {!data ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          数据生成失败，请刷新重试。
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <SingleElimBracket matches={data.matches} champion="v" groupWinners={data.groupWinners} />

          <div style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>
            <RulePanel title={mode === 'swiss' ? '瑞士轮 → 单败淘汰' : 'GSL 双败 → 单败淘汰'} icon="📖">
              {mode === 'swiss' ? (
                <>
                  <h4 style={{ color: '#1d1d1f', marginTop: 8, marginBottom: 4, fontSize: 13, fontWeight: 640 }}>瑞士轮路径（Major 模式）</h4>
                  <ul style={{ paddingLeft: 16, marginBottom: 8 }}>
                    <li>三轮瑞士轮过滤后，8 支队伍进入季后赛</li>
                    <li>种子 1v8、4v5、2v7、3v6</li>
                    <li>QF (4场) → SF (2场) → 总决赛</li>
                  </ul>
                  <Tip>
                    瑞士轮出来的 8 队实力已经过充分检验，每组对战都极具看点。这也是 Major 最经典的单败淘汰形式。
                  </Tip>
                </>
              ) : (
                <>
                  <h4 style={{ color: '#1d1d1f', marginTop: 8, marginBottom: 4, fontSize: 13, fontWeight: 640 }}>GSL 双败路径（IEM / BLAST 模式）</h4>
                  <ul style={{ paddingLeft: 16, marginBottom: 8 }}>
                    <li>两组 GSL 各出 3 队，共 6 队进入季后赛</li>
                    <li>各组第 1 名 <Badge variant="win">轮空直通半决赛</Badge></li>
                    <li>各组第 2、3 名进入四分之一决赛</li>
                    <li>QF: A2 vs B3 | B2 vs A3（跨组交叉）</li>
                    <li>SF: A1 vs QF2胜 | B1 vs QF1胜</li>
                    <li>总决赛 BO5</li>
                  </ul>
                  <Tip>
                    GSL 双败的"奖励"非常实在：小组第 1 直接进半决赛，只需要赢 2 场就能夺冠。而 QF 队伍要赢 3 场。
                    这也是为什么 GSL 小组赛阶段争夺第 1 名如此激烈。
                  </Tip>
                </>
              )}

              <h4 style={{ color: '#1d1d1f', marginTop: 14, marginBottom: 4, fontSize: 13, fontWeight: 640 }}>共同特点</h4>
              <ul style={{ paddingLeft: 16 }}>
                <li>全部单败淘汰，一场定生死</li>
                <li>QF/SF 用 BO3，总决赛 BO5</li>
                <li>小组赛排名直接决定淘汰赛走线难度</li>
              </ul>
            </RulePanel>
          </div>
        </div>
      )}
    </div>
  );
}
