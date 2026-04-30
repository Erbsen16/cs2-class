import { useMemo } from 'react';
import { teams } from '../engine/teams';
import { generateGSLDemo } from '../engine/gsl';
import GslBracket from '../components/GslBracket';
import RulePanel, { Tip, Badge } from '../components/RulePanel';

export default function Gsl() {
  const groups = useMemo(() => {
    const subset = [...teams].sort((a, b) => a.seed - b.seed).slice(0, 8);
    return generateGSLDemo(subset.map(t => t.id), 42);
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 64px' }} className="page-enter">
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8, marginBottom: 6, color: '#1d1d1f' }}>
          GSL 双败淘汰
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 440 }}>
          GSL Double Elimination — 4 队一组，种子错位对打。两场胜者直接晋级，败者再打一场决出最后一个名额。IEM 和 BLAST 广泛使用。
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <GslBracket groups={groups} />

        <div style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>
          <RulePanel title="规则要点" icon="📖">
            <h4 style={{ color: '#1d1d1f', marginTop: 8, marginBottom: 4, fontSize: 13, fontWeight: 640 }}>基本规则</h4>
            <ul style={{ paddingLeft: 16, marginBottom: 8 }}>
              <li>每组 4 队，共 4 场比赛</li>
              <li><strong>胜者组</strong>：两场首轮胜者会师决赛 → 胜者 <Badge variant="win">第1</Badge>，败者 <Badge variant="win">第2</Badge>（双双晋级）</li>
              <li><strong>败者组</strong>：两场首轮败者对战 → 胜者 <Badge variant="win">第3</Badge>，败者 <Badge variant="loss">淘汰</Badge></li>
              <li>每组 3 人出线，仅 1 人被淘汰</li>
            </ul>

            <h4 style={{ color: '#1d1d1f', marginTop: 14, marginBottom: 4, fontSize: 13, fontWeight: 640 }}>流程</h4>
            <div style={{ fontSize: 12, lineHeight: 2.1, paddingLeft: 4 }}>
              <div>① 1号 vs 4号 ─┐</div>
              <div>② 2号 vs 3号 ─┤</div>
              <div>③ ①胜 vs ②胜 → 第1/第2（双双晋级）</div>
              <div>④ ①败 vs ②败 → 第3/淘汰</div>
            </div>

            <h4 style={{ color: '#1d1d1f', marginTop: 14, marginBottom: 4, fontSize: 13, fontWeight: 640 }}>特点</h4>
            <ul style={{ paddingLeft: 16 }}>
              <li>强队有"第二条命"——首轮输了还能从败者组杀回来</li>
              <li>胜者组决赛决定第1/第2，无论输赢都稳进季后赛</li>
              <li>第1名季后赛轮空直通半决赛，第2名要多打一轮 QF</li>
              <li>赛程短，3 场就出结果</li>
            </ul>

            <Tip>
              胜者组决赛的特殊之处：V 和 A 已经分别在首轮赢了，但还要再打一场来决出谁是第 1、谁是第 2。
              这场比赛无论输赢，两人都晋级——只是第 1 名季后赛直接进半决赛，第 2 名要多打一轮 QF。
            </Tip>

            <Tip>
              种子优势关键：1 号打 4 号、2 号打 3 号，强队首轮不互撞。
              即使翻车，还能从败者组救回来抢第 3 名。真正被淘汰的只有连输两场的队伍。
            </Tip>
          </RulePanel>
        </div>
      </div>
    </div>
  );
}
