/* 高等工程数学A26 · 学习数据 · 模块三：矩阵分解与广义逆
 *
 * 内容来源：课件《2.1 矩阵分解与广义逆》(51页) 的文本抽取 + 14 页图片型幻灯片的人工识读。
 * ★ 所有矩阵答案均由 numpy / sympy 逐题独立复算通过。
 *   其中例2.1.1 的 L 矩阵曾被人眼误读为 [[1,0,0],[2,1,0],[-1,-2,1]]，
 *   经 L·U 验算证伪（得出 [-2,-8,1] ≠ A 的第三行 [-2,4,5]），
 *   正确值为 [[1,0,0],[2,1,0],[-1,2,1]]。
 *
 * 注意：本课件第2章虽有「广义逆」目录项(2.2/2.3)，但幻灯片只讲到矩阵分解为止，
 *       K11 广义逆为按通用大纲补写，已如实标注。
 */
window.KP_C = [
{
  id: "K07",
  title: "矩阵的三角分解（LU / Doolittle / Cholesky）",
  module: "矩阵分解与广义逆",
  level: 7,
  importance: "core",
  stars: 3,
  summary: "把方阵 A 拆成一个单位下三角阵 L 和一个上三角阵 U 的乘积 A = LU，从而把解方程组、求行列式、求逆都变成「两个三角形」上的简单递推。",
  why: "三角分解是解线性方程组高斯消元法的矩阵语言。它服务于：①解 Ax=b 时只需前代+回代，复杂度从 O(n³) 降到 O(n²)（分解一次可反复用不同右端项）；②det A = det L · det U = u₁₁u₂₂…uₙₙ，行列式变成对角元连乘；③Cholesky 分解 A=LLᵀ 是正定矩阵的「开平方」，是后面 K10 奇异值分解与最小二乘数值稳定性的基础。",
  concept: [
    "【为什么要分解】直接求 A⁻¹ 再算 x=A⁻¹b 是浪费的：求逆要 O(n³) 且数值不稳定。如果 A=LU，则 Ax=b 变成 L(Ux)=b，先解 Ly=b（前代，自上而下逐行代入），再解 Ux=y（回代，自下而上）。两次代入都只用 O(n²) 次运算，而且如果只是 b 变了、A 没变，L 和 U 可以重复使用。",
    "【Doolittle 分解的存在唯一性】设 A 是 n 阶方阵，若 A 的前 n−1 个顺序主子式 Δ₁, Δ₂, …, Δₙ₋₁ 全不为零（Δ_k ≠ 0），则 A 存在唯一的 Doolittle 分解 A=LU，其中 L 是单位下三角阵（主对角元全为 1），U 是上三角阵。注意：只要求前 n−1 个，最后一个 Δₙ=det A 可以为零——此时 A 奇异，但分解照样存在。",
    "【顺序主子式的条件为什么必要】反例最能说明问题：A=[[0,1],[1,0]] 非奇异，但 a₁₁=0，第一步消元就要除以 0，所以不存在 LU 分解。这时要引入「带行交换的三角分解」PA=LU：先用置换矩阵 P 把主元换到对角线上（列主元消去法）。课件中定理 2.1.2 指出：设 A 非奇异，则必存在置换矩阵 P，使得 PA=LU。",
    "【Cholesky 分解】若 A 是 Hermite 正定矩阵，则存在唯一的 A=LLᴴ，其中 L 是主对角线元素为正数的下三角阵。它是 LU 分解在对称正定情形下的「压缩版」——因为对称性，U 不用另外存，就是 Lᴴ，存储量和计算量都省一半。判断正定可用顺序主子式全大于零（Sylvester 判据）。"
  ],
  table: [
    {"分解":"Doolittle (A=LU)","适用条件":"A 的前 n−1 个顺序主子式 ≠ 0","特点":"L 单位下三角，U 上三角；不换行"},
    {"分解":"带行交换 (PA=LU)","适用条件":"A 非奇异","特点":"先选主元再消元，数值更稳定"},
    {"分解":"Cholesky (A=LLᴴ)","适用条件":"A 为 Hermite 正定","特点":"L 对角元全正且唯一；计算量约省一半"}
  ],
  formulas: [
    {"tex": "A = LU,\\quad L=\\begin{pmatrix}1&0&0\\\\ l_{21}&1&0\\\\ l_{31}&l_{32}&1\\end{pmatrix},\\quad U=\\begin{pmatrix}u_{11}&u_{12}&u_{13}\\\\ 0&u_{22}&u_{23}\\\\ 0&0&u_{33}\\end{pmatrix}", "note": "Doolittle 分解的标准形状"},
    {"tex": "\\det A=\\det L\\cdot\\det U=u_{11}u_{22}\\cdots u_{nn}", "note": "行列式化为 U 的对角元连乘"},
    {"tex": "A=LL^{H},\\qquad l_{kk}=\\sqrt{a_{kk}-\\sum_{j\\lt k}|l_{kj}|^{2}}", "note": "Cholesky 的对角元递推公式"},
    {"tex": "PA=LU", "note": "带行交换的三角分解，P 为置换矩阵"}
  ],
  prereq: ["K03"],
  serves: ["K08", "K10", "K11"],
  servesNote: "①LU 是 QR 分解（K08）与 SVD（K10）在算法实现上的底层构件；②广义逆（K11）求 A⁺ 时常用满秩分解或 QR/SVD，而这些分解的数值实现都建立在消元与三角化之上；③Cholesky 是正定线性系统与最小二乘的标配解法。",
  examples: [
    {
      title: "例2.1.1（课件 p10）：求三阶矩阵的三角分解",
      problem: "求矩阵 $A=\\begin{pmatrix}2&2&3\\\\ 4&7&7\\\\ -2&4&5\\end{pmatrix}$ 的三角分解 $A=LU$。",
      steps: [
        "对增广矩阵 $[A\\mid I]$ 做初等行变换，把左半部分化成上三角：第2行减去第1行的2倍，第3行加上第1行",
        "得 $\\begin{pmatrix}2&2&3&\\mid&1&0&0\\\\ 0&3&1&\\mid&-2&1&0\\\\ 0&6&8&\\mid&1&0&1\\end{pmatrix}$",
        "第3行再减去第2行的2倍，得 $\\begin{pmatrix}2&2&3&\\mid&1&0&0\\\\ 0&3&1&\\mid&-2&1&0\\\\ 0&0&6&\\mid&5&-2&1\\end{pmatrix}\\triangleq[U\\mid L^{-1}]$",
        "于是 $U=\\begin{pmatrix}2&2&3\\\\ 0&3&1\\\\ 0&0&6\\end{pmatrix}$，$L^{-1}=\\begin{pmatrix}1&0&0\\\\ -2&1&0\\\\ 5&-2&1\\end{pmatrix}$",
        "对单位下三角阵求逆：$L=(L^{-1})^{-1}=\\begin{pmatrix}1&0&0\\\\ 2&1&0\\\\ -1&2&1\\end{pmatrix}$（注意第3行第2列是 $+2$，不是 $-2$）",
        "验算：$L\\cdot U=\\begin{pmatrix}2&2&3\\\\ 4&7&7\\\\ -2&4&5\\end{pmatrix}=A$ ✓"
      ],
      answer: "$L=\\begin{pmatrix}1&0&0\\\\ 2&1&0\\\\ -1&2&1\\end{pmatrix}$，$U=\\begin{pmatrix}2&2&3\\\\ 0&3&1\\\\ 0&0&6\\end{pmatrix}$，即 $A=LU$。顺带 $\\det A=2\\times3\\times6=36$。",
      source: "课件 2.1 p10（图片型幻灯片）"
    },
    {
      title: "例2.1.3（课件 p18）：对称正定矩阵的 Cholesky 分解",
      problem: "已知对称矩阵 $A=\\begin{pmatrix}2&1&1\\\\ 1&3&2\\\\ 1&2&2\\end{pmatrix}$，求 $A$ 的 Cholesky 分解。",
      steps: [
        "先验证正定性：顺序主子式 $\\Delta_1=2>0$，$\\Delta_2=\\begin{vmatrix}2&1\\\\ 1&3\\end{vmatrix}=5>0$，$\\Delta_3=\\det A=3>0$，故 $A$ 正定",
        "课件走的是合同对角化路线：对 $\\begin{pmatrix}A&I\\\\ I&O\\end{pmatrix}$ 做同步行、列变换，把 A 化为对角阵 $D$",
        "得 $GAG^{T}=D$，其中 $D=\\operatorname{diag}(2,\\ \\tfrac{5}{2},\\ \\tfrac{3}{5})$，$G=\\begin{pmatrix}1&0&0\\\\ -\\frac12&1&0\\\\ -\\frac15&-\\frac35&1\\end{pmatrix}$",
        "由 $GAG^{T}=D$ 反解 $A=G^{-1}D\\,G^{-T}$，取 $D^{1/2}=\\operatorname{diag}(\\sqrt2,\\sqrt{5/2},\\sqrt{3/5})$，令 $L=G^{-1}D^{1/2}$",
        "算得 $L=\\begin{pmatrix}\\sqrt2&0&0\\\\ \\frac{\\sqrt2}{2}&\\frac{\\sqrt{10}}{2}&0\\\\ \\frac{\\sqrt2}{2}&\\frac{3\\sqrt{10}}{10}&\\frac{\\sqrt{15}}{5}\\end{pmatrix}$，可验证 $LL^{T}=A$ ✓"
      ],
      answer: "$A=LL^{T}$，$L=\\begin{pmatrix}\\sqrt2&0&0\\\\ \\frac{\\sqrt2}{2}&\\frac{\\sqrt{10}}{2}&0\\\\ \\frac{\\sqrt2}{2}&\\frac{3\\sqrt{10}}{10}&\\frac{\\sqrt{15}}{5}\\end{pmatrix}$（数值约为 $\\begin{pmatrix}1.4142&0&0\\\\ 0.7071&1.5811&0\\\\ 0.7071&0.9487&0.7746\\end{pmatrix}$）。",
      source: "课件 2.1 p18（图片型幻灯片），Cholesky 结果由 numpy 复算确认"
    },
    {
      title: "辨析例（课件 p12）：判断矩阵是否存在三角分解",
      problem: "$A=\\begin{pmatrix}0&1&1\\\\ 1&0&2\\\\ 1&2&1\\end{pmatrix}$ 是否存在三角分解？",
      steps: [
        "看第一个顺序主子式：$\\Delta_1=a_{11}=0$",
        "Doolittle 分解要求前 $n-1$ 个顺序主子式均不为零，这里 $\\Delta_1=0$ 已经违反",
        "直观上：消元第一步要用 $a_{11}$ 作除数去消第2、3行，而 $a_{11}=0$，无法进行"
      ],
      answer: "不存在（Doolittle）三角分解。但 $A$ 非奇异（$\\det A=3\\ne0$），所以由定理2.1.2 一定存在**带行交换**的三角分解 $PA=LU$——交换第1、2行后 $a_{11}$ 就变成 1 了。",
      source: "课件 2.1 p12（图片型幻灯片）"
    },
    {
      title: "补充例 A（由 numpy 生成并验算）：标准 Doolittle 分解",
      problem: "求 $A=\\begin{pmatrix}-3&3&3\\\\ 3&-5&-2\\\\ -3&1&8\\end{pmatrix}$ 的 Doolittle 分解。",
      steps: [
        "验证条件：$\\Delta_1=-3\\ne0$，$\\Delta_2=\\begin{vmatrix}-3&3\\\\ 3&-5\\end{vmatrix}=6\\ne0$，条件满足",
        "按行消元：第2行加上第1行（$l_{21}=-1$），第3行加上第1行（$l_{31}=1$）",
        "得 $\\begin{pmatrix}-3&3&3\\\\ 0&-2&1\\\\ 0&4&5\\end{pmatrix}$，再用第2行消第3行：$l_{32}=-2$，第3行减去第2行的 $-2$ 倍",
        "得 $U=\\begin{pmatrix}-3&3&3\\\\ 0&-2&1\\\\ 0&0&4\\end{pmatrix}$",
        "组合出 $L=\\begin{pmatrix}1&0&0\\\\ -1&1&0\\\\ 1&1&1\\end{pmatrix}$，验算 $LU=A$ ✓"
      ],
      answer: "$L=\\begin{pmatrix}1&0&0\\\\ -1&1&0\\\\ 1&1&1\\end{pmatrix}$，$U=\\begin{pmatrix}-3&3&3\\\\ 0&-2&1\\\\ 0&0&4\\end{pmatrix}$，$\\det A=-3\\times(-2)\\times4=24$。",
      source: "原创（按 K07 知识点设计，答案经 numpy 验算）"
    },
    {
      title: "补充例 B（由 numpy 生成并验算）：Cholesky 分解整数解",
      problem: "求 $A=\\begin{pmatrix}9&3&6\\\\ 3&5&4\\\\ 6&4&14\\end{pmatrix}$ 的 Cholesky 分解。",
      steps: [
        "验证正定：$\\Delta_1=9>0$，$\\Delta_2=36>0$，$\\Delta_3=144>0$",
        "用递推公式：$l_{11}=\\sqrt{a_{11}}=\\sqrt9=3$",
        "$l_{21}=a_{21}/l_{11}=3/3=1$，$l_{31}=a_{31}/l_{11}=6/3=2$",
        "$l_{22}=\\sqrt{a_{22}-l_{21}^2}=\\sqrt{5-1}=2$",
        "$l_{32}=(a_{32}-l_{31}l_{21})/l_{22}=(4-2\\times1)/2=1$",
        "$l_{33}=\\sqrt{a_{33}-l_{31}^2-l_{32}^2}=\\sqrt{14-4-1}=3$"
      ],
      answer: "$L=\\begin{pmatrix}3&0&0\\\\ 1&2&0\\\\ 2&1&3\\end{pmatrix}$，全为整数，$LL^{T}=A$ ✓。",
      source: "原创（按 K07 知识点设计，答案经 numpy 验算）"
    },
    {
      title: "补充例 C（由 numpy 生成并验算）：带行交换的三角分解",
      problem: "求 $A=\\begin{pmatrix}0&1&-1\\\\ -1&0&-1\\\\ 2&1&3\\end{pmatrix}$ 的带行交换三角分解 $PA=LU$。（课件 p15 同类练习）",
      steps: [
        "$a_{11}=0$，直接消元会除以零，必须先换行：把第3行换到第1行（取绝对值最大的主元 2）",
        "置换矩阵 $P=\\begin{pmatrix}0&0&1\\\\ 0&1&0\\\\ 1&0&0\\end{pmatrix}$，则 $PA=\\begin{pmatrix}2&1&3\\\\ -1&0&-1\\\\ 0&1&-1\\end{pmatrix}$",
        "对 $PA$ 做 Doolittle 消元：第2行加第1行的 $\\tfrac12$ 倍，得第2行 $\\to(0,\\tfrac12,\\tfrac12)$",
        "第3行不变，用第2行消第3行：$l_{32}=2$，第3行减第2行的2倍 $\\to(0,0,-2)$"
      ],
      answer: "取 $P=\\begin{pmatrix}0&0&1\\\\ 0&1&0\\\\ 1&0&0\\end{pmatrix}$，$L=\\begin{pmatrix}1&0&0\\\\ -\\frac12&1&0\\\\ 0&2&1\\end{pmatrix}$，$U=\\begin{pmatrix}2&1&3\\\\ 0&\\frac12&\\frac12\\\\ 0&0&-2\\end{pmatrix}$，满足 $PA=LU$（已由 numpy 验算）。",
      source: "原创（按 K07 知识点设计，结构参考课件 p15 练习，答案经 numpy 验算）"
    }
  ],
  quiz: [
    {"type":"choice","q":"$A=\\begin{pmatrix}0&1\\\\ 1&0\\end{pmatrix}$ 不存在 Doolittle 分解 $A=LU$ 的根本原因是：","options":["$A$ 是奇异矩阵","$a_{11}=0$，消元第一步就要除以零","$A$ 不是对称矩阵","$\\det A=0$"],"answer":1,"explain":"$\\det A=-1\\ne0$，$A$ 并不奇异。问题出在 $\\Delta_1=a_{11}=0$，违反「前 $n-1$ 个顺序主子式非零」的条件。这说明**非奇异只是 $PA=LU$ 的条件，不是 $A=LU$ 的条件**。"},
    {"type":"choice","q":"若 $A=LU$ 是 Doolittle 分解，则 $\\det A$ 等于：","options":["$L$ 的对角元连乘","$U$ 的对角元连乘","$L$ 与 $U$ 全部元素之积","无法由 $L,U$ 确定"],"answer":1,"explain":"Doolittle 分解中 $L$ 是单位下三角阵，$\\det L=1$，所以 $\\det A=\\det L\\cdot\\det U=\\det U=u_{11}u_{22}\\cdots u_{nn}$。"},
    {"type":"choice","q":"设 $A=\\begin{pmatrix}2&1&1\\\\ 1&3&2\\\\ 1&2&2\\end{pmatrix}$，其 Cholesky 分解 $A=LL^{T}$ 中 $l_{11}$ 等于：","options":["$\\sqrt{2}$","$2$","$5$","$\\sqrt{3}$"],"answer":0,"explain":"Cholesky 对角元递推的首项是 $l_{11}=\\sqrt{a_{11}}=\\sqrt2$——**要开方**，所以不是 $a_{11}=2$ 本身；$5$ 是二阶顺序主子式 $\\Delta_2=a_{11}a_{22}-a_{12}a_{21}$；$\\sqrt3=\\sqrt{a_{22}}$ 是第二个对角元。（已由 sympy 精确复算：$l_{11}=\\sqrt2$ 且 $L\\cdot L^{T}=A$。）"},
    {"type":"choice","q":"若 $A=LU$，其中 $L$ 为单位下三角阵、$U=\\begin{pmatrix}2&2&3\\\\ 0&3&1\\\\ 0&0&6\\end{pmatrix}$，则 $\\det A$ 等于：","options":["$6$","$11$","$36$","$216$"],"answer":2,"explain":"$\\det A=\\det L\\cdot\\det U=1\\times(2\\times3\\times6)=36$。干扰项来源：$6$ 只取了 $u_{33}$；$11=2+3+6$ 把对角元连乘误作连加；$216=6^{3}$ 是误把 $\\det L$ 也算成了 $6$。"},
    {"type":"choice","q":"已知 $A=LU$（$L$ 单位下三角、$U$ 上三角），求解 $Ax=b$ 的正确做法是：","options":["对增广矩阵 $[A\\mid b]$ 重新做一次高斯消元","先解 $Uy=b$（回代），再解 $Lx=y$（前代）","先求 $A^{-1}$，再算 $x=A^{-1}b$","先解 $Ly=b$（前代），再解 $Ux=y$（回代）"],"answer":3,"explain":"由 $A=LU$ 得 $L(Ux)=b$，令 $y=Ux$：先自上而下解 $Ly=b$（前代），再自下而上解 $Ux=y$（回代）。两次代入各约 $O(n^{2})$，而且 $A$ 不变、只换 $b$ 时 $L,U$ 可反复使用——这正是三角分解比「先求逆」或「重新消元」划算的地方。"},
    {"type":"choice","q":"与一般 LU 分解相比，Cholesky 分解的存储量与计算量约省一半，其根本原因是：","options":["它的对角元递推中不再出现开方运算","它对任意非奇异方阵都适用，因而更省事","它不要求顺序主子式满足任何条件","$A$ 对称正定时 $U=L^{H}$，两个因子只需存一个、算一个"],"answer":3,"explain":"对称正定时 $A=LL^{H}$，$L$ 一确定，$U=L^{H}$ 就随之确定，存储与计算量都约省一半。其余三项都与事实相反：Cholesky 的递推式里恰恰**有**开方（$l_{kk}=\\sqrt{a_{kk}-\\sum_{j\\lt k}|l_{kj}|^{2}}$）；它只适用于 Hermite 正定阵，适用范围比 LU 更窄；对顺序主子式的要求反而更强（要求全部 $\\Delta_k>0$）。"},
    {"type":"choice","q":"判断一个实对称矩阵能否作 Cholesky 分解，可直接验证的条件是：","options":["全部顺序主子式都大于零","前 $n-1$ 个顺序主子式都不等于零","矩阵的秩等于 $n$","矩阵的所有元素都大于零"],"answer":0,"explain":"Cholesky 要求 $A$ 为 Hermite 正定，而正定的判据是 Sylvester 判据：**全部**顺序主子式都大于零。第二个选项（前 $n-1$ 个顺序主子式非零）是 Doolittle 分解 $A=LU$ 的条件，弱得多且不保证正定；「秩等于 $n$」只说明 $A$ 非奇异；「元素全大于零」既不充分也不必要。"},
    {"type":"choice","q":"关于带行交换的三角分解 $PA=LU$（$P$ 为置换矩阵），下列说法正确的是：","options":["只有当 $A$ 的前 $n-1$ 个顺序主子式全不为零时才存在","要求 $A$ 为对称正定矩阵","只要 $A$ 非奇异，就必存在这样的分解","要求 $A$ 可对角化"],"answer":2,"explain":"课件定理 2.1.2：$A$ 非奇异时必存在置换矩阵 $P$ 使 $PA=LU$——先把非零主元换到对角线上就避开了除零。第一个选项是 $A=LU$（不换行）的条件，苛刻得多；对称正定、可对角化更不是必要条件。典型例子：$A=\\begin{pmatrix}0&1\\\\ 1&1\\end{pmatrix}$ 非奇异且 $\\Delta_1=a_{11}=0$，故它没有 $A=LU$，但交换两行后 $PA=LU$ 成立。"},
  ],
  faq: [
    {"q":"为什么只要求前 n−1 个顺序主子式非零，最后一个（即 det A）可以为零？","a":"因为消元过程只进行 n−1 步：第 1 步到第 n−1 步各需要一个非零主元，对应 Δ₁…Δₙ₋₁。第 n 步不再需要消元，所以 Δₙ=det A 是否为零不影响分解能否进行。当 det A=0 时 A 奇异，U 的最后一个对角元 u_nn=0，但 L、U 本身照样存在。"},
    {"q":"Cholesky 分解和 LU 分解到底什么关系？","a":"Cholesky 是 LU 在「对称正定」这个特殊情形下的改良版。一般 LU 要把 L 和 U 两套矩阵都存下来；对称正定时 U=Lᵀ，只存一个 L 就够，存储和计算量都省约一半。代价是要求 A 正定，且分解过程要开平方——所以 Cholesky 只能用在正定矩阵上。"},
    {"q":"实际做题时怎么快速判断该用哪种分解？","a":"三步走：①先看 a₁₁ 是否为零——为零就一定不是普通 LU，要考虑换行（PA=LU）；②再看矩阵是否对称——如果对称且顺序主子式全正，优先 Cholesky，算起来最省事；③如果矩阵本身是长方形（m≠n）或者不满秩，那么 LU/Cholesky 都不适用，要走满秩分解（K09）或 SVD（K10）。"}
  ]
},
{
  id: "K08",
  title: "矩阵的正交分解（QR 分解）",
  module: "矩阵分解与广义逆",
  level: 8,
  importance: "core",
  stars: 3,
  summary: "把矩阵 A 拆成 A=QR，其中 Q 是酉（正交）矩阵、R 是上三角阵。因为 Q 保持长度不变，QR 分解是数值上最稳定的分解之一。",
  why: "QR 分解的核心价值在于 Q 是正交矩阵——正交变换不放大误差（‖Qx‖=‖x‖），所以基于 QR 的算法数值稳定性极好。它服务于：①最小二乘问题 min‖Ax−b‖，用 QR 比用正规方程 AᵀAx=Aᵀb 稳定得多（后者会把条件数平方）；②求特征值的 QR 算法（本章 K10 的 SVD 也依赖它）；③解线性方程组时替代 LU 以获得更好的稳定性。",
  concept: [
    "【几何意义】Gram-Schmidt 正交化的本质是「把 A 的列向量逐个改造成标准正交基」。设 A 的列向量为 a₁,a₂,…,aₙ，Schmidt 方法就是依次从每个 aₖ 中减掉它在前面的 q₁,…,qₖ₋₁ 上的投影，剩下的部分再单位化。写成矩阵形式就是 A=QR：Q 的列是标准正交基，R 记录了每次「投影系数」和「长度」。",
    "【定理2.1.4】设 A 为 n 阶可逆复矩阵，则 A 有唯一的 QR 分解 A=QR，其中 Q 为酉矩阵，R 是主对角元为正数的上三角阵。「R 对角元为正」这一条是保证唯一性的关键——如果不要求正，那么每个列都可以自由地乘 ±1，分解就不唯一了。",
    "【两种算法，各有用武之地】① Schmidt 正交化：思路直观，适合手算和讲解，但数值上不稳定（当列向量接近线性相关时，舍入误差会迅速放大）。② Householder 变换：用镜面反射矩阵 H=I−2ωωᵀ 一次性把一整列「打平」（把第一个分量以下的全部清零），数值稳定，是工程实现的标准做法。",
    "【长方形矩阵的推广（推论）】若 A 是 m×n 矩阵，也可分解为 A=QR：当 m≥n 时 Q 是 m×n 的「部分列酉矩阵」（各列标准正交），R 是 n 阶上三角阵；当 m≤n 时 Q 是 m 阶酉矩阵，R 是 m×n 的上三角阵。"
  ],
  table: [
    {"方法":"Schmidt 正交化","适用":"可逆方阵、手算","稳定性":"较差（列近似相关时误差放大）"},
    {"方法":"Householder 变换","适用":"任意矩阵、工程实现","稳定性":"好（正交变换不放大误差）"},
    {"方法":"Givens 旋转变换","适用":"稀疏矩阵、逐元素清零","稳定性":"好（常用于并行计算）"}
  ],
  formulas: [
    {"tex": "A=QR,\\quad Q^{H}Q=I,\\quad R=\\begin{pmatrix}r_{11}&r_{12}&r_{13}\\\\ 0&r_{22}&r_{23}\\\\ 0&0&r_{33}\\end{pmatrix},\\ r_{ii}>0", "note": "QR 分解的标准形状（唯一）"},
    {"tex": "y_{k}=a_{k}-\\sum_{j\\lt k}(a_{k},q_{j})\\,q_{j},\\qquad q_{k}=\\frac{y_{k}}{\\|y_{k}\\|_{2}}", "note": "Schmidt 正交化的递推公式"},
    {"tex": "H=I-2\\omega\\omega^{T},\\quad \\|\\omega\\|_{2}=1,\\quad H^{H}=H,\\ H^{2}=I", "note": "Householder 矩阵（既是酉矩阵又是对合矩阵）"},
    {"tex": "r_{kj}=(a_{k},q_{j}),\\qquad r_{kk}=\\|y_{k}\\|_{2}", "note": "R 的元素由投影系数与长度给出"}
  ],
  prereq: ["K02", "K03", "K07"],
  serves: ["K10", "K11"],
  servesNote: "①QR 是求特征值的 QR 算法的基础，也是 SVD（K10）数值实现的核心步骤；②最小二乘与广义逆（K11）的稳定算法都建立在 QR 之上；③Householder 变换的思想在后面求 SVD 时的正交对角化中反复使用。",
  examples: [
    {
      title: "例2.1.4（课件 p23）：用 Schmidt 正交化求 QR 分解",
      problem: "用 Schmidt 正交化方法求矩阵 $A=\\begin{pmatrix}1&1&0\\\\ 0&1&1\\\\ 1&0&2\\end{pmatrix}$ 的 QR 分解。",
      steps: [
        "记列向量 $a_1=[1,0,1]^{T}$，$a_2=[1,1,0]^{T}$，$a_3=[0,1,2]^{T}$",
        "第一列：$y_1=a_1$，$\\|y_1\\|_2=\\sqrt2$，$q_1=\\frac{y_1}{\\|y_1\\|_2}=[\\tfrac{\\sqrt2}{2},0,\\tfrac{\\sqrt2}{2}]^{T}$",
        "第二列：投影系数 $(a_2,q_1)=\\tfrac{\\sqrt2}{2}$，故 $y_2=a_2-(a_2,q_1)q_1=[\\tfrac12,1,-\\tfrac12]^{T}$，$\\|y_2\\|_2=\\tfrac{\\sqrt6}{2}$，$q_2=[\\tfrac{\\sqrt6}{6},\\tfrac{\\sqrt6}{3},-\\tfrac{\\sqrt6}{6}]^{T}$",
        "第三列：$(a_3,q_1)=\\sqrt2$，$(a_3,q_2)=0$，故 $y_3=a_3-(a_3,q_1)q_1-(a_3,q_2)q_2=[-1,1,1]^{T}$，$\\|y_3\\|_2=\\sqrt3$，$q_3=[-\\tfrac{\\sqrt3}{3},\\tfrac{\\sqrt3}{3},\\tfrac{\\sqrt3}{3}]^{T}$",
        "把系数组装成 R 并验算 $QR=A$ ✓"
      ],
      answer: "$Q=\\begin{pmatrix}\\frac{\\sqrt2}{2}&\\frac{\\sqrt6}{6}&-\\frac{\\sqrt3}{3}\\\\ 0&\\frac{\\sqrt6}{3}&\\frac{\\sqrt3}{3}\\\\ \\frac{\\sqrt2}{2}&-\\frac{\\sqrt6}{6}&\\frac{\\sqrt3}{3}\\end{pmatrix}$，$R=\\begin{pmatrix}\\sqrt2&\\frac{\\sqrt2}{2}&\\sqrt2\\\\ 0&\\frac{\\sqrt6}{2}&0\\\\ 0&0&\\sqrt3\\end{pmatrix}$。",
      source: "课件 2.1 p23（图片型幻灯片），已由 numpy 验算 Q·R=A 且 Q 正交"
    },
    {
      title: "例2.1.5（课件 p32）：用 Householder 变换求 QR 分解",
      problem: "用 Householder 变换求矩阵 $A=\\begin{pmatrix}0&4&2\\\\ 0&3&1\\\\ 2&1&-2\\end{pmatrix}$ 的 QR 分解。",
      steps: [
        "取第一列 $x_1=[0,0,2]^{T}$，$\\alpha_1=\\|x_1\\|_2=2$",
        "$\\omega_1=\\frac{x_1-\\alpha_1 e_1}{\\|x_1-\\alpha_1 e_1\\|_2}=\\frac{1}{\\sqrt2}[-1,0,1]^{T}$（其中 $e_1=[1,0,0]^{T}$）",
        "构造 $H_1=I_3-2\\omega_1\\omega_1^{T}=\\begin{pmatrix}0&0&1\\\\ 0&1&0\\\\ 1&0&0\\end{pmatrix}$，作用是交换第1、3行",
        "$H_1A=\\begin{pmatrix}2&1&-2\\\\ 0&3&1\\\\ 0&4&2\\end{pmatrix}$，第一列已只剩第一个非零元 ✓",
        "对右下角 $x_1^{(1)}=[3,4]^{T}$ 重复：$\\alpha_2=\\|x_1^{(1)}\\|_2=5$，$\\omega_2=\\frac{x_1^{(1)}-\\alpha_2\\tilde e_1}{\\|\\cdot\\|_2}=\\frac{1}{\\sqrt5}[-1,2]^{T}$",
        "构造 $H_2$ 并左乘，重复直到化为上三角，$Q=H_1H_2\\cdots$"
      ],
      answer: "关键是每一步的 $\\omega$：$\\omega_1=\\frac{1}{\\sqrt2}[-1,0,1]^{T}$，$\\omega_2=\\frac{1}{\\sqrt5}[-1,2]^{T}$。最终 $R=H_2H_1A$ 为上三角阵，$Q=(H_2H_1)^{T}=H_1H_2$（因 $H$ 对称且 $H^2=I$，故 $H^{-1}=H$）。",
      source: "课件 2.1 p32（图片型幻灯片）；$H_1A$ 与 $\\omega_2$ 已由 numpy 验算"
    },
    {
      title: "补充例（课件 p34 练习）：Householder 变换求 QR 分解（完整过程）",
      problem: "利用 Householder 变换求矩阵 $A=\\begin{pmatrix}0&1&1\\\\ 1&1&0\\\\ 1&0&1\\end{pmatrix}$ 的 QR 分解。",
      steps: [
        "<b>第一步：消去第 1 列对角线以下的元素。</b>记 $A$ 的第 1 列为 $a_1=[0,1,1]^{T}$，则 $\\|a_1\\|_2=\\sqrt2$。取 $\\alpha_1=\\|a_1\\|_2=\\sqrt2$ 作反射的\"落点\"（$a_{11}=0$，符号本可任取；这里取正号）。",
        "令 $u_1=a_1-\\alpha_1e_1=[0,1,1]^{T}-[\\sqrt2,0,0]^{T}=[-\\sqrt2,1,1]^{T}$，则 $\\|u_1\\|_2=\\sqrt{2+1+1}=2$，单位化得 $\\omega_1=\\dfrac{u_1}{\\|u_1\\|_2}=\\left[-\\dfrac{\\sqrt2}{2},\\ \\dfrac12,\\ \\dfrac12\\right]^{T}$。",
        "构造 $H_1=I-2\\omega_1\\omega_1^{T}=\\begin{pmatrix}0&\\frac{\\sqrt2}{2}&\\frac{\\sqrt2}{2}\\\\[2pt] \\frac{\\sqrt2}{2}&\\frac12&-\\frac12\\\\[2pt] \\frac{\\sqrt2}{2}&-\\frac12&\\frac12\\end{pmatrix}$。<b>先验算它确实管用</b>：$H_1a_1=\\left[\\sqrt2,\\ 0,\\ 0\\right]^{T}$ ✓（这一步一定要验，否则后面全错）。",
        "把 $H_1$ 左乘到整个 $A$ 上，得 $H_1A=\\begin{pmatrix}\\sqrt2&\\frac{\\sqrt2}{2}&\\frac{\\sqrt2}{2}\\\\[2pt] 0&\\frac12+\\frac{\\sqrt2}{2}&-\\frac12+\\frac{\\sqrt2}{2}\\\\[2pt] 0&-\\frac12+\\frac{\\sqrt2}{2}&\\frac12+\\frac{\\sqrt2}{2}\\end{pmatrix}$，第 1 列已达标。",
        "<b>第二步：对右下 2×2 块重复同样的操作。</b>取第 2 列对角线以下的子向量 $x_2=\\left[\\frac{1+\\sqrt2}{2},\\ \\frac{\\sqrt2-1}{2}\\right]^{T}$，则 $\\|x_2\\|_2=\\frac12\\sqrt{(1+\\sqrt2)^2+(\\sqrt2-1)^2}=\\frac{\\sqrt6}{2}$。",
        "取 $\\alpha_2=-\\dfrac{\\sqrt6}{2}$（<b>取负号是有讲究的</b>：$x_2$ 首元 $\\frac{1+\\sqrt2}{2}>0$，取异号才能避免两个相近的数相减、保住有效数字）。令 $v_2=x_2-\\alpha_2\\tilde e_1=\\left[\\frac{1+\\sqrt2+\\sqrt6}{2},\\ \\frac{\\sqrt2-1}{2}\\right]^{T}$。",
        "这一步算 $H_2$ 建议用<b>未归一化形式</b> $H_2=I-\\dfrac{2v_2v_2^{T}}{v_2^{T}v_2}$，其中 $v_2^{T}v_2=\\frac{\\sqrt6}{2}+\\sqrt3+3$ —— 比先算 $\\omega_2=v_2/\\|v_2\\|_2$ 再写 $I-2\\omega_2\\omega_2^{T}$ 干净得多（后者会出现 $\\sqrt{\\sqrt6+2\\sqrt3+6}$ 这种嵌套根式，没法看）。把 $H_2$ 嵌入 3 阶（左上角补 1）后作用上去，$x_2$ 被化为 $\\left[-\\frac{\\sqrt6}{2},0\\right]^{T}$。",
        "<b>组装。</b>因为 $H$ 既对称又对合（$H^{T}=H$，$H^2=I$），所以 $H^{-1}=H$。于是 $A=H_1H_2\\cdot H_2H_1A$，即 $Q=H_1H_2$，$R=H_2H_1A$。",
        "<b>规范化符号。</b>上面取 $\\alpha_2$ 为负，导致 $R$ 的 $(2,2)$ 元是 $-\\frac{\\sqrt6}{2}$。把 $R$ 的第 2 行乘 $-1$、$Q$ 的第 2 列同时乘 $-1$（$QR$ 不变），就得到 $R$ 对角元全正的<b>标准形</b> —— 这个形式是唯一的。"
      ],
      answer: "$Q=\\begin{pmatrix}0&\\frac{\\sqrt6}{3}&\\frac{\\sqrt3}{3}\\\\[2pt] \\frac{\\sqrt2}{2}&\\frac{\\sqrt6}{6}&-\\frac{\\sqrt3}{3}\\\\[2pt] \\frac{\\sqrt2}{2}&-\\frac{\\sqrt6}{6}&\\frac{\\sqrt3}{3}\\end{pmatrix}$，$R=\\begin{pmatrix}\\sqrt2&\\frac{\\sqrt2}{2}&\\frac{\\sqrt2}{2}\\\\[2pt] 0&\\frac{\\sqrt6}{2}&\\frac{\\sqrt6}{6}\\\\[2pt] 0&0&\\frac{2\\sqrt3}{3}\\end{pmatrix}$，即 $A=QR$。<br><b>验算</b>：$QR=A$ ✓；$Q^{T}Q=I$ ✓；$R$ 为上三角且三个对角元 $\\sqrt2,\\ \\frac{\\sqrt6}{2},\\ \\frac{2\\sqrt3}{3}$ 全为正 ✓（数值 $1.4142,\\ 1.2247,\\ 1.1547$）。" +
        "<br><br><b>⚠️ 一个必答的疑问：$\\det A=-2$，$\\det R$ 却是 $+2$，少了个负号？</b><br>" +
        "没有少。因为 $\\det A=\\det Q\\cdot\\det R$，而本题 $\\det Q=-1$，于是 $\\det Q\\cdot\\det R=(-1)\\times(+2)=-2=\\det A$ ✓。<b>符号由 $\\det Q$ 承担了，$R$ 的对角元不需要出现负数。</b>" +
        "<br>要注意：<b>$R$ 的对角元全为正，正是标准 QR 唯一的保证</b>——若不要求对角元为正，每个列都可自由乘 $\\pm1$，分解就不唯一了。所以这里的 $+\\frac{2\\sqrt3}{3}$ 是<b>被唯一确定的</b>。" +
        "<br><b>反证</b>：把 $R(3,3)$ 改成 $-\\frac{2\\sqrt3}{3}$，则 $QR$ 的第三列变成 $\\left[-\\frac13,\\ \\frac43,\\ -\\frac13\\right]^{T}$，而 $A$ 的第三列是 $[1,0,1]^{T}$ —— 对不上。" +
        "<br><br>顺带说明：<b>numpy 的 <code>np.linalg.qr</code> 给出的 $R$ 是 $\\begin{pmatrix}-\\sqrt2&\\cdots\\\\ 0&\\frac{\\sqrt6}{2}&\\cdots\\\\ 0&0&\\frac{2\\sqrt3}{3}\\end{pmatrix}$</b>，第一个对角元是 <b>$-\\sqrt2$</b>，对应 $\\det R=-2=\\det A$。" +
        "这<b>也是合法的 QR 分解</b>，只是没有规范到「对角元全为正」的形式。两版对角元的<b>绝对值逐项相同</b>（$\\sqrt2,\\frac{\\sqrt6}{2},\\frac{2\\sqrt3}{3}$），差别只在 $R(1,1)$ 的符号 —— <b>要挑符号的话，该挑 $R(1,1)$，不是 $R(3,3)$。</b>",
      source: "课件 2.1 p34 练习；完整过程与最终 Q、R 由 sympy 精确算术求解并逐项验算（QR=A、QᵀQ=I、R 上三角、对角元为正、det Q·det R = det A），并与 numpy 的 QR 结果逐项对照"
    },
    {
      title: "补充例（由 numpy 生成并验算）：整数矩阵的 QR",
      problem: "求 $A=\\begin{pmatrix}-2&-1&-3\\\\ 2&1&1\\\\ 0&3&-3\\end{pmatrix}$ 的 QR 分解（用 Schmidt 正交化，结果保留根式）。",
      steps: [
        "$a_1=[-2,2,0]^{T}$，$\\|a_1\\|_2=\\sqrt{8}=2\\sqrt2$，$q_1=[-\\tfrac{\\sqrt2}{2},\\tfrac{\\sqrt2}{2},0]^{T}$",
        "$(a_2,q_1)=(-1)(-\\tfrac{\\sqrt2}{2})+(1)(\\tfrac{\\sqrt2}{2})+0=\\sqrt2$，故 $y_2=a_2-\\sqrt2 q_1=[0,0,3]^{T}$，$\\|y_2\\|=3$，$q_2=[0,0,1]^{T}$",
        "$(a_3,q_1)=(-3)(-\\tfrac{\\sqrt2}{2})+(1)(\\tfrac{\\sqrt2}{2})+0=2\\sqrt2$，$(a_3,q_2)=-3$",
        "$y_3=a_3-2\\sqrt2 q_1-(-3)q_2=[0,0,-3]+3[0,0,1]^{T}$ 计算后得 $y_3=[-1,-1,0]^{T}$，$\\|y_3\\|=\\sqrt2$，$q_3=[-\\tfrac{\\sqrt2}{2},-\\tfrac{\\sqrt2}{2},0]^{T}$"
      ],
      answer: "$Q=\\begin{pmatrix}-\\frac{\\sqrt2}{2}&0&-\\frac{\\sqrt2}{2}\\\\ \\frac{\\sqrt2}{2}&0&-\\frac{\\sqrt2}{2}\\\\ 0&1&0\\end{pmatrix}$，$R=\\begin{pmatrix}2\\sqrt2&\\sqrt2&2\\sqrt2\\\\ 0&3&-3\\\\ 0&0&\\sqrt2\\end{pmatrix}$（numpy 验算 $QR=A$ ✓）。",
      source: "原创（按 K08 知识点设计，答案经 numpy 验算）"
    },
    {
      title: "补充例（课件 p25 练习）：Schmidt 正交化求正交分解",
      problem: "用 Schmidt 正交化方法求方阵 $A=\\begin{pmatrix}0&4&2\\\\ 0&3&1\\\\ 2&1&-2\\end{pmatrix}$ 的正交分解。",
      steps: [
        "第一列 $a_1=[0,0,2]^{T}$，$\\|a_1\\|=2$，$q_1=[0,0,1]^{T}$，故 $r_{11}=2$。",
        "$r_{12}=(a_2,q_1)=4\\cdot0+3\\cdot0+1\\cdot1=1$；$y_2=a_2-r_{12}q_1=[4,3,1]^{T}-[0,0,1]^{T}=[4,3,0]^{T}$，$\\|y_2\\|=5=r_{22}$，$q_2=[\\tfrac45,\\tfrac35,0]^{T}$。",
        "$r_{13}=(a_3,q_1)=2\\cdot0+1\\cdot0+(-2)\\cdot1=-2$；$r_{23}=(a_3,q_2)=2\\cdot\\tfrac45+1\\cdot\\tfrac35+(-2)\\cdot0=\\tfrac{11}{5}$。",
        "$y_3=a_3-r_{13}q_1-r_{23}q_2=a_3+2q_1-\\tfrac{11}{5}q_2=[2,1,-2]+[0,0,2]-[\\tfrac{44}{25},\\tfrac{33}{25},0]=[\\tfrac{6}{25},-\\tfrac{8}{25},0]^{T}$。",
        "<b>关键一步别算错</b>：$\\|y_3\\|=\\sqrt{\\left(\\tfrac{6}{25}\\right)^2+\\left(\\tfrac{8}{25}\\right)^2}=\\sqrt{\\tfrac{100}{625}}=\\tfrac{10}{25}=\\boldsymbol{\\tfrac25}$，所以 $r_{33}=\\tfrac25$（<b>不是 2</b>——这里极易写成 2）。$q_3=y_3/\\|y_3\\|=\\left[\\tfrac65\\cdot\\tfrac52,\\ -\\tfrac85\\cdot\\tfrac52,\\ 0\\right]^{T}=[\\tfrac35,-\\tfrac45,0]^{T}$。",
        "验算 $Q\\cdot R$ 是否等于 $A$（见下方答案）。"
      ],
      answer: "$Q=\\begin{pmatrix}0&\\frac45&\\frac35\\\\ 0&\\frac35&-\\frac45\\\\ 1&0&0\\end{pmatrix}$，$R=\\begin{pmatrix}2&1&-2\\\\ 0&5&\\frac{11}{5}\\\\ 0&0&\\boldsymbol{\\frac25}\\end{pmatrix}$。<br><b>自检</b>：$|\\det A|=|\\det R|=2\\times5\\times\\frac25=4$ ✓（$\\det A=-4$）；$r_{33}=\\frac25$ 而非 2 —— 写成 2 的话 $QR$ 的第三列会变成 $[2.96,-0.28,-2]^{T}$，与 $A$ 的第三列 $[2,1,-2]^{T}$ 对不上。",
      source: "课件 2.1 p25（图片型幻灯片）；$r_{23}=\\frac{11}{5}$、$r_{33}=\\frac25$ 均由复算确认（原先 $r_{33}$ 误记为 2，已修正）"
    },
    {
      title: "概念例：为什么正交矩阵不放大误差",
      problem: "设 $Q$ 为正交矩阵，证明 $\\|Qx\\|_2=\\|x\\|_2$，并说明这对 QR 分解的数值稳定性意味着什么。",
      steps: [
        "$\\|Qx\\|_2^2=(Qx)^{T}(Qx)=x^{T}Q^{T}Qx$",
        "由正交性 $Q^{T}Q=I$，得 $\\|Qx\\|_2^2=x^{T}x=\\|x\\|_2^2$",
        "两边开方即得 $\\|Qx\\|_2=\\|x\\|_2$"
      ],
      answer: "正交变换保持 2-范数不变，即不放大任何向量的长度，因此输入数据的舍入误差经 $Q$ 作用后不会被放大。这正是 QR 分解比 LU 分解数值更稳定的根本原因，也是最小二乘问题要用 QR 而不是正规方程的原因（正规方程会把条件数平方，误差放大一倍指数）。",
      source: "原创（按 K08 知识点设计，K02/K03 范数性质的应用）"
    }
  ],
  quiz: [
    {"type":"choice","q":"QR 分解 $A=QR$ 中要求 $R$ 的主对角元为正数，其主要作用是：","options":["保证 $R$ 可逆","保证分解的唯一性","保证 $Q$ 是正交阵","减少计算量"],"answer":1,"explain":"如果不要求对角元为正，每列可以自由乘 $\\pm1$（$Q$ 的第 $k$ 列变号、$R$ 的第 $k$ 行变号），分解就不唯一了。加上「对角元为正」这一约束后，定理2.1.4 保证分解唯一。"},
    {"type":"choice","q":"与 Schmidt 正交化相比，Householder 变换求 QR 分解的主要优势是：","options":["计算量更小","结果更精确（可以用分数表示）","数值稳定性更好","不需要矩阵可逆"],"answer":2,"explain":"Schmidt 方法当列向量接近线性相关时舍入误差会被急剧放大；Householder 用的是正交（酉）变换，保持 2-范数不变，不放大误差，因此工程实现都用它。注意 Householder 并不要求 A 可逆。"},
    {"type":"choice","q":"设 $A=\\begin{pmatrix}1&1&0\\\\ 0&1&1\\\\ 1&0&2\\end{pmatrix}$ 的 QR 分解中 $Q$ 的第一列为 $[\\frac{\\sqrt2}{2},0,\\frac{\\sqrt2}{2}]^{T}$，则 $r_{11}$ 等于：","options":["$1$","$2$","$\\sqrt{3}$","$\\sqrt{2}$"],"answer":3,"explain":"$r_{11}=\\|a_1\\|_2=\\|(1,0,1)^{T}\\|_2=\\sqrt{1+0+1}=\\sqrt2$——R 的对角元就是各列正交化后的长度。$\\sqrt3$ 是第三列正交化后的长度 $r_{33}$，不是第一列的。"},
    {"type":"choice","q":"Householder 矩阵 $H=I-2\\omega\\omega^{T}$（$\\|\\omega\\|_2=1$）满足：","options":["$H^{2}=I$","$H^{2}=H$","$H^{2}=O$","$H^{2}=-I$"],"answer":0,"explain":"$H$ 是对合矩阵：它表示镜面反射，反射两次回到原处，故 $H^{2}=I$，于是 $H^{-1}=H$，求 $Q$ 时不必真的求逆；又因 $H^{T}=H$，$H$ 既是酉矩阵又是对称阵。其余选项都不是它的性质：$H^{2}=H$ 是**幂等**矩阵（如投影）的性质，而 $H=I-2P$（$P=\\omega\\omega^{T}$）时 $H^{2}=(I-2P)^{2}=I-4P+4P^{2}=I\\ne H$；$O$ 属于幂零矩阵；$-I$ 属于旋转 $180^{\\circ}$。"},
    {"type":"choice","q":"QR 分解比 LU 分解数值上更稳定的根本原因是：","options":["$R$ 是上三角矩阵，回代过程不产生舍入误差","$QR$ 分解不需要做任何除法运算","$QR$ 分解的结果唯一，误差因此被消除","$Q$ 为正交（酉）矩阵，$\\|Qx\\|_{2}=\\|x\\|_{2}$，正交变换不放大舍入误差"],"answer":3,"explain":"由 $Q^{T}Q=I$ 得 $\\|Qx\\|_2^{2}=x^{T}Q^{T}Qx=x^{T}x=\\|x\\|_2^{2}$，即正交变换保持 2-范数不变，输入数据的舍入误差经 $Q$ 作用后不被放大——这正是最小二乘要用 QR 而不是正规方程（后者把条件数平方）的原因。其余选项都不成立：$R$ 上的回代照样有舍入误差；Schmidt 步骤里既有除法又有开方；唯一性只保证分解结果唯一，与误差是否被放大无关。"},
    {"type":"choice","q":"在 Schmidt 正交化求 QR 分解的过程中，$r_{kk}$ 等于：","options":["$\\|y_{k}\\|_{2}$","$\\|a_{k}\\|_{2}$","$\\|y_{k}\\|_{2}^{2}$","$(a_{k},q_{j})$（$j\\lt k$）"],"answer":0,"explain":"Schmidt 递推为 $y_{k}=a_{k}-\\sum_{j\\lt k}(a_{k},q_{j})q_{j}$、$q_{k}=\\frac{y_{k}}{\\|y_{k}\\|_{2}}$，而 $r_{kk}=\\|y_{k}\\|_{2}$——R 的对角元就是这一步「剩下的长度」。$\\|a_{k}\\|_{2}$ 是没做正交化的原长度，一般大于 $r_{kk}$；$\\|y_{k}\\|_{2}^{2}$ 少开了一次方；第四个选项那类内积给出的是 R 的**非对角**元 $r_{kj}=(a_{k},q_{j})$。"},
    {"type":"choice","q":"设 $A$ 是 $m\\times n$ 矩阵且 $m\\ge n$，则其 QR 分解 $A=QR$ 中 $Q$、$R$ 的形状是：","options":["$Q$ 为 $m$ 阶酉矩阵，$R$ 为 $m\\times n$ 上三角阵","$Q$ 为 $m\\times n$（各列标准正交），$R$ 为 $n$ 阶上三角阵","$Q$ 为 $n$ 阶酉矩阵，$R$ 为 $m\\times n$ 上三角阵","$Q$ 为 $m\\times n$，$R$ 为 $m$ 阶上三角阵"],"answer":1,"explain":"长方形情形的推论：$m\\ge n$ 时 $Q$ 是 $m\\times n$ 的「部分列酉矩阵」（各列标准正交），$R$ 是 $n$ 阶上三角阵，$(m\\times n)(n\\times n)=m\\times n$ 尺寸正好对上。$m\\le n$ 时才对调：$Q$ 是 $m$ 阶酉矩阵、$R$ 是 $m\\times n$ 上三角阵。做题先数清行列，别把两种情形搞反。"},
    {"type":"choice","q":"适合稀疏矩阵、且能逐个元素清零的 QR 分解方法是：","options":["Householder 变换","Schmidt 正交化","Givens 旋转变换","Cholesky 分解"],"answer":2,"explain":"课件对照表里写得很明确：Givens 旋转变换适用于稀疏矩阵、逐元素清零，稳定性好且常用于并行计算；Householder 的做法是一次性把一整列「打平」，不是为稀疏结构设计的；Schmidt 正交化在列向量接近线性相关时舍入误差会被急剧放大；Cholesky 是 Hermite 正定矩阵的三角分解 $A=LL^{H}$，根本不是 QR 方法。"},
  ],
  faq: [
    {"q":"手算时该选 Schmidt 还是 Householder？","a":"考试手算首选 Schmidt——步骤机械、每一步都是「减投影再单位化」，不容易出错。Householder 的好处是能一次性打平一整列，但中间要算 ω、构造 H、再做矩阵乘法，手算量大且容易算错。记住结论：**Schmidt 适合手算，Householder 适合编程**（数值稳定）。"},
    {"q":"为什么 R 的对角元就是各列的长度？","a":"因为 QR 分解可以看成 Gram-Schmidt 过程的矩阵记录：$q_k$ 是第 k 列正交化后的单位向量，$r_{kk}=\\|y_k\\|_2$ 就是这一步「剩下的长度」。所以 $|\\det A|=|\\det R|=r_{11}r_{22}\\cdots r_{nn}$，R 的对角元越小说明列向量越接近线性相关。"},
    {"q":"长方形矩阵怎么做 QR？","a":"完全一样的步骤，只是结果形态不同：若 A 是 m×n 且 m≥n，则 Q 是 m×n（列正交，叫「部分列酉矩阵」），R 是 n×n 上三角；若 m≤n，Q 是 m 阶方阵，R 是 m×n 的上三角阵。做题时先数清行列，别把维度搞反。"}
  ]
},
{
  id: "K09",
  title: "矩阵的满秩分解",
  module: "矩阵分解与广义逆",
  level: 9,
  importance: "key",
  stars: 2,
  summary: "把秩为 r 的 m×n 矩阵 A 拆成 A=FG，其中 F 是 m×r 列满秩矩阵、G 是 r×n 行满秩矩阵。它把「不满秩」的麻烦集中到两个满秩因子上。",
  why: "满秩分解是广义逆（K11）最直接的理论工具：只要有了 A=FG 且 F、G 都列/行满秩，就能立刻写出 A 的一个广义逆 G⁻¹F⁻¹（其中 F⁻¹、G⁻¹ 是单侧逆）。它服务于：①构造 {1}-逆；②把秩亏最小二乘问题降维成满秩问题；③分解结果同时给出了 A 的秩 r 与列空间、行空间的基。",
  concept: [
    "【Hermite 标准型是入口】满秩分解的做法是「先化简，再拆开」。对 A 做初等行变换，把它化成 Hermite 标准型 H（行最简形）。H 中非零行数就是秩 r。",
    "【F 和 G 怎么取】设 H 的 r 个非零行的首个非零元位于第 j₁, j₂, …, j_r 列。则 F 取 A 中对应的第 j₁, j₂, …, j_r 列构成的 m×r 矩阵，G 取 H 的前 r 行构成的 r×n 矩阵。这样 A=FG。",
    "【为什么这样取是对的】课件定理2.1.6 的证明思路是：因为 A 与 H 行等价，存在可逆矩阵 P 使 PA=H；而 H 的前 r 行构成 G、其余行为零，于是 A=P⁻¹H=P⁻¹[G;O]。把 P⁻¹ 按前 r 列分块成 F，就得到 A=FG。由秩的不等式 r=rank(A)=rank(FG)≤rank(F)≤r 可知 F 必列满秩，G 同理行满秩。",
    "【与其它分解的关系】满秩分解不是唯一的（选不同的行变换路径，或对 F 做任意 r 阶可逆右乘、G 做左乘，都还是满秩分解）。它是最「朴素」的分解，不含正交性要求，因此计算最容易，但数值稳定性不如 QR/SVD。"
  ],
  table: [
    {"概念":"Hermite 标准型 H","含义":"行最简形：非零行首元为 1，且该列其余元全为 0"},
    {"概念":"F（列满秩）","取法":"A 中对应 H 主元列的那些列"},
    {"概念":"G（行满秩）","取法":"H 的前 r 行"},
    {"概念":"秩 r","来源":"H 中非零行的个数"}
  ],
  formulas: [
    {"tex": "A_{m\\times n}=F_{m\\times r}\\,G_{r\\times n},\\qquad \\operatorname{rank}(F)=r,\\ \\operatorname{rank}(G)=r", "note": "满秩分解的定义（r 为 A 的秩）"},
    {"tex": "PA=H=\\begin{pmatrix}G\\\\ O\\end{pmatrix}\\ \\Longrightarrow\\ A=P^{-1}\\begin{pmatrix}G\\\\ O\\end{pmatrix}=FG", "note": "定理2.1.6 的证明思路"},
    {"tex": "A=F(F^{H}AF)^{-1}F^{H}", "note": "当 F 列满秩时，F(FᴴAF)⁻¹Fᴴ 是沿 F 的列空间的正交投影"}
  ],
  prereq: ["K07", "K08"],
  serves: ["K11"],
  servesNote: "满秩分解是构造广义逆（K11）最方便的入口：若 A=FG，则 G⁻¹F⁻¹（单侧逆）就是 A 的一个 {1}-逆。它把「求不满秩矩阵的逆」转化成了两个满秩矩阵的单侧逆问题。",
  examples: [
    {
      title: "例2.1.6（课件 p40）：求 3×4 矩阵的满秩分解",
      problem: "求矩阵 $A=\\begin{pmatrix}1&2&3&0\\\\ 0&2&1&-1\\\\ 1&0&2&1\\end{pmatrix}$ 的满秩分解。",
      steps: [
        "对 A 做初等行变换化为 Hermite 标准型：第3行减去第1行",
        "得 $\\begin{pmatrix}1&2&3&0\\\\ 0&2&1&-1\\\\ 0&-2&-1&1\\end{pmatrix}$，再把第3行加上第2行得 $\\begin{pmatrix}1&2&3&0\\\\ 0&2&1&-1\\\\ 0&0&0&0\\end{pmatrix}$",
        "第2行除以2，再从第1行减去第2行的2倍，化为行最简形",
        "$H=\\begin{pmatrix}1&0&2&1\\\\ 0&1&\\frac12&-\\frac12\\\\ 0&0&0&0\\end{pmatrix}$，非零行数为 2，故 $r=2$",
        "主元在第 1、2 列，故 $j_1=1,\\ j_2=2$。取 A 的第1、2列构成 $F$，取 H 的前两行构成 $G$",
        "验算 $FG=A$ ✓"
      ],
      answer: "$A=\\begin{pmatrix}1&2\\\\ 0&2\\\\ 1&0\\end{pmatrix}\\begin{pmatrix}1&0&2&1\\\\ 0&1&\\frac12&-\\frac12\\end{pmatrix}$，其中 $F$ 列满秩、$G$ 行满秩，秩 $r=2$。",
      source: "课件 2.1 p40（图片型幻灯片），FG=A 已由 numpy 验算"
    },
    {
      title: "练习（课件 p41）：满秩分解（完整过程）",
      problem: "求矩阵 $A=\\begin{pmatrix}-2&-4&-6&-30\\\\ 1&2&1&7\\\\ 1&2&4&19\\end{pmatrix}$ 的满秩分解。",
      steps: [
        "<b>第一步：先化 Hermite 标准型（行最简形）—— 这一步不能跳。</b>因为 $F$ 该取 $A$ 的哪几列，完全由主元落在第几列决定；不先化标准型，取列就是瞎猜。",
        "交换第 1、2 行（让首元为 1）：$\\begin{pmatrix}1&2&1&7\\\\ -2&-4&-6&-30\\\\ 1&2&4&19\\end{pmatrix}$",
        "第 2 行加上第 1 行的 2 倍，第 3 行减去第 1 行：$\\begin{pmatrix}1&2&1&7\\\\ 0&0&-4&-16\\\\ 0&0&3&12\\end{pmatrix}$",
        "第 2 行除以 $-4$：$\\begin{pmatrix}1&2&1&7\\\\ 0&0&1&4\\\\ 0&0&3&12\\end{pmatrix}$；再让第 3 行减去第 2 行的 3 倍：$\\begin{pmatrix}1&2&1&7\\\\ 0&0&1&4\\\\ 0&0&0&0\\end{pmatrix}$",
        "第 1 行减去第 2 行（把主元列上方的数也消成 0），得 Hermite 标准型 $H=\\begin{pmatrix}1&2&0&3\\\\ 0&0&1&4\\\\ 0&0&0&0\\end{pmatrix}$。",
        "<b>读信息</b>：非零行有 2 行 → 秩 $r=2$；主元（每行第一个 1）落在<b>第 1 列和第 3 列</b>。",
        "<b>取 F 和 G</b>：$F$ 取 $A$ 中对应主元列的那两列（第 1、3 列）；$G$ 取 $H$ 的前 $r=2$ 行。",
        "<b>验算</b>：$F\\cdot G$ 逐项算出等于 $A$ ✓（这一步一定要做——$F$、$G$ 不唯一，唯一能确认对不对的办法就是乘回去。）"
      ],
      answer: "$F=\\begin{pmatrix}-2&-6\\\\ 1&1\\\\ 1&4\\end{pmatrix}$（即 $A$ 的第 1、3 列），$G=\\begin{pmatrix}1&2&0&3\\\\ 0&0&1&4\\end{pmatrix}$（即 $H$ 的前两行），满足 $A=FG$。<br><b>形状自检</b>：$F$ 是 $3\\times2$ 列满秩，$G$ 是 $2\\times4$ 行满秩，中间维数 2 恰好等于秩 $r$ ✓。",
      source: "课件 2.1 p41（图片型幻灯片，已按 300dpi 重渲染逐字核对）；过程与 F·G=A 由 sympy 精确复算确认"
    },
    {
      title: "补充例：判断满秩分解的因数形状",
      problem: "设 $A$ 是 $5\\times7$ 矩阵且 $\\operatorname{rank}(A)=3$，其满秩分解 $A=FG$ 中 $F$、$G$ 各是什么形状？",
      steps: [
        "满秩分解定义：$A_{m\\times n}=F_{m\\times r}G_{r\\times n}$，其中 $r=\\operatorname{rank}(A)$",
        "代入 $m=5$，$n=7$，$r=3$"
      ],
      answer: "$F$ 是 $5\\times3$ 的列满秩矩阵，$G$ 是 $3\\times7$ 的行满秩矩阵。检验：$(5\\times3)(3\\times7)=5\\times7$ ✓，中间的维数 3 恰好就是秩。",
      source: "原创（按 K09 知识点设计）"
    },
    {
      title: "补充例：满秩分解与列空间",
      problem: "为什么满秩分解 $A=FG$ 中的 $F$ 的列向量组构成 $A$ 的列空间的一组基？",
      steps: [
        "由 $A=FG$，A 的每一列都是 F 的列的线性组合（组合系数由 G 的对应列给出）",
        "所以 $\\operatorname{Col}(A)\\subseteq\\operatorname{Col}(F)$",
        "又 F 列满秩，其 r 个列线性无关，故 $\\dim\\operatorname{Col}(F)=r=\\operatorname{rank}(A)=\\dim\\operatorname{Col}(A)$",
        "子空间维数相同且互相包含，故 $\\operatorname{Col}(A)=\\operatorname{Col}(F)$"
      ],
      answer: "$A=FG$ 说明 A 的列都在 F 的列空间中；而 F 列满秩保证了 F 的列线性无关且个数恰为 r，所以 F 的列构成 $\\operatorname{Col}(A)$ 的一组基。同理，$G$ 的行构成 A 的行空间的一组基。",
      source: "原创（按 K09 知识点设计）"
    }
  ],
  quiz: [
    {"type":"choice","q":"设 $A$ 是 $4\\times6$ 矩阵，$\\operatorname{rank}(A)=2$，则满秩分解 $A=FG$ 中 $G$ 的形状是：","options":["$4\\times2$","$2\\times6$","$6\\times2$","$4\\times6$"],"answer":1,"explain":"满秩分解 $A_{m\\times n}=F_{m\\times r}G_{r\\times n}$。这里 $m=4,n=6,r=2$，所以 F 是 $4\\times2$，G 是 $2\\times6$。"},
    {"type":"choice","q":"满秩分解中的 $F$ 是怎么从原矩阵得到的？","options":["取 A 的前 r 行","取 A 中对应 Hermite 标准型主元列的那些列","取 A 的前 r 列","由 A 的特征向量组成"],"answer":1,"explain":"关键在「主元列」而不是「前 r 列」。必须先求 Hermite 标准型 H，看非零行的首元落在哪几列（设为 $j_1,\\dots,j_r$），再回到 A 中取这几列。如果主元在第1、3列，取的就必须是 A 的第1、3列。"},
    {"type":"choice","q":"设 $A=\\begin{pmatrix}1&2&3&0\\\\ 0&2&1&-1\\\\ 1&0&2&1\\end{pmatrix}$，若其满秩分解为 $A=FG$，则 $A$ 的秩 $r$ 与 $G$ 的形状分别是：","options":["$r=2$，$G$ 为 $2\\times4$","$r=3$，$G$ 为 $3\\times4$","$r=2$，$G$ 为 $4\\times2$","$r=3$，$G$ 为 $4\\times3$"],"answer":0,"explain":"把 $A$ 化为 Hermite 标准型（行最简形）得 $H=\\begin{pmatrix}1&0&2&1\\\\ 0&1&\\frac12&-\\frac12\\\\ 0&0&0&0\\end{pmatrix}$，非零行只有 2 行，所以 $r=2$——第 3 行被消成零行，不能按「有 3 行」算成 3。$G$ 取 $H$ 的前 $r$ 行，形状是 $r\\times n=2\\times4$。把秩按行数算成 3、或把 $G$ 的 $r\\times n$ 形状记反成 $n\\times r$，都会落到其余选项上。"},
    {"type":"choice","q":"若 $A=FG$ 是 $A$ 的满秩分解，$\\operatorname{rank}(A)=r$，则 $F$ 的列数等于：","options":["$m$（$A$ 的行数）","$n$（$A$ 的列数）","$r$（即 $A$ 的秩）","$\\min(m,n)$"],"answer":2,"explain":"满秩分解的定义就是 $A_{m\\times n}=F_{m\\times r}G_{r\\times n}$——中间维数恰好是秩 $r$（这也是它叫「满秩分解」的原因：$F$ 列满秩、$G$ 行满秩）。$F$ 列满秩意味着它的 $r$ 个列线性无关；若列数小于 $r$，$FG$ 的秩就会小于 $r$，矛盾。"},
    {"type":"choice","q":"满秩分解 $A=FG$ 中，$F$ 的 $r$ 个列向量构成：","options":["$A$ 的零空间的一组基","$A$ 的行空间的一组基","整个 $\\mathbb{R}^{m}$ 的一组基","$A$ 的列空间 $\\operatorname{Col}(A)$ 的一组基"],"answer":3,"explain":"由 $A=FG$，$A$ 的每一列都是 $F$ 的列的线性组合（组合系数由 $G$ 的对应列给出），故 $\\operatorname{Col}(A)\\subseteq\\operatorname{Col}(F)$；又 $F$ 列满秩，$\\operatorname{dim}\\operatorname{Col}(F)=r=\\operatorname{dim}\\operatorname{Col}(A)$，两个子空间维数相同且互相包含，故相等，$F$ 的列就是 $\\operatorname{Col}(A)$ 的一组基。行空间的基由 $G$ 的**行**给出，不是 $F$ 的列；零空间与 $F$ 的列无关；$r\\le m$ 一般小于 $m$，张不满 $\\mathbb{R}^{m}$。"},
    {"type":"choice","q":"关于满秩分解的唯一性，正确的说法是：","options":["不唯一：对任意 $r$ 阶可逆矩阵 $S$，$A=(FS)(S^{-1}G)$ 仍是满秩分解","唯一：由 $A$ 完全确定","只有当 $A$ 本身满秩时才唯一","不唯一，因为 $F$ 与 $G$ 的秩可以不同"],"answer":0,"explain":"满秩分解不唯一：任取 $r$ 阶可逆矩阵 $S$，$FS$ 仍列满秩、$S^{-1}G$ 仍行满秩，而 $(FS)(S^{-1}G)=FG=A$，所以它也是满秩分解；此外化 Hermite 标准型时走不同的行变换路径，取到的 $F$、$G$ 也可能不同。做题时只要验证 $FG=A$、$F$ 列满秩、$G$ 行满秩即可。最后一个选项说法本身有误——$F$、$G$ 的秩**都**等于 $r$，这是定义的一部分。"},
    {"type":"choice","q":"定理2.1.6（满秩分解的存在性）的证明中，由 $PA=H=\\begin{pmatrix}G\\\\ O\\end{pmatrix}$ 推出 $A=FG$ 的关键一步是：","options":["把 $A$ 的前 $r$ 行取作 $F$","把 $H$ 的前 $r$ 列取作 $G$","对 $A$ 作正交三角化，取 $Q$ 为 $F$","把 $P^{-1}$ 按前 $r$ 列分块，取该分块为 $F$"],"answer":3,"explain":"证明思路：由 $PA=H$ 得 $A=P^{-1}\\begin{pmatrix}G\\\\ O\\end{pmatrix}$，把可逆矩阵 $P^{-1}$ 按**前 $r$ 列**分块，该分块就是 $F$，于是 $A=FG$。再由 $r=\\operatorname{rank}(A)=\\operatorname{rank}(FG)\\le\\operatorname{rank}(F)\\le r$ 夹出 $F$ 必列满秩，$G$ 同理行满秩。$F$ 取的是 $A$ 中对应的**主元列**（即对 $P^{-1}$ 作列分块），不是 $A$ 的前 $r$ 行；$G$ 取的是 $H$ 的前 $r$ **行**，不是前 $r$ 列。"},
    {"type":"choice","q":"设 $A=\\begin{pmatrix}-2&-4&-6&-30\\\\ 1&2&1&7\\\\ 1&2&4&19\\end{pmatrix}$，其 Hermite 标准型为 $H=\\begin{pmatrix}1&2&0&3\\\\ 0&0&1&4\\\\ 0&0&0&0\\end{pmatrix}$，则满秩分解 $A=FG$ 中的 $F$ 是：","options":["$\\begin{pmatrix}-2&-4\\\\ 1&2\\\\ 1&2\\end{pmatrix}$","$\\begin{pmatrix}-6&-30\\\\ 1&7\\\\ 4&19\\end{pmatrix}$","$\\begin{pmatrix}-2&-6\\\\ 1&1\\\\ 1&4\\end{pmatrix}$","$\\begin{pmatrix}1&2\\\\ 0&0\\\\ 0&0\\end{pmatrix}$"],"answer":2,"explain":"$H$ 的主元落在第 1、3 列，所以 $F$ 取 $A$ 的第 1、3 列，即 $\\begin{pmatrix}-2&-6\\\\ 1&1\\\\ 1&4\\end{pmatrix}$。其余都是「按位置猜列」的典型错法：取 $A$ 的前两列或后两列（都不是主元列），或把 $H$ 的列当成了 $F$。验算：$F\\begin{pmatrix}1&2&0&3\\\\ 0&0&1&4\\end{pmatrix}=A$ ✓（已由 sympy 精确复算）。"},
  ],
  faq: [
    {"q":"满秩分解唯一吗？","a":"不唯一。原因有两层：①化 Hermite 标准型时如果采用不同的行变换路径，得到的 H 可能不同（虽然行最简形本身唯一，但若中途不做彻底化简，取到的 F、G 会不同）；②即使固定了一组 F、G，对任意 r 阶可逆矩阵 S，$A=FG=(FS)(S^{-1}G)$ 也是满秩分解。所以做题时只要验证 $FG=A$、两边分别列满秩/行满秩即可，不必和标准答案逐字相同。"},
    {"q":"为什么不能直接用 LU 或 QR 而要单独搞一个满秩分解？","a":"LU 要求方阵且顺序主子式非零，QR 虽然对长方形矩阵也能做，但它们的出发点都是「数值求解」。满秩分解的出发点是「代数结构」——它把秩亏矩阵写成两个满秩矩阵之积，最直接地服务于广义逆的构造。它计算最省事（只要行变换），代价是不唯一、数值稳定性一般。"},
    {"q":"Hermite 标准型和行最简形是一回事吗？","a":"基本是一回事，不同教材叫法不同。要点都是：①非零行的第一个非零元素是 1（主元）；②主元所在列的其他元素全为 0；③零行在最下面。做满秩分解时必须化到这一步，因为只有主元列的「1 和 0」结构才能保证取出的 F 列满秩。"}
  ]
},
{
  id: "K10",
  title: "矩阵的奇异值分解（SVD）",
  module: "矩阵分解与广义逆",
  level: 10,
  importance: "core",
  stars: 3,
  summary: "任何矩阵 A（不要求方阵、不要求满秩）都能分解为 A=UΣVᴴ，其中 U、V 是酉矩阵，Σ 是对角阵且对角元为非负的奇异值。SVD 被称为「矩阵的解剖刀」。",
  why: "SVD 是矩阵分解中适用面最广的一个——它对任意 m×n 矩阵都存在，不需要可逆、不需要方阵、不需要正定。它服务于：①求矩阵的秩（非零奇异值个数）与最佳低秩逼近（Eckart-Young 定理，是数据压缩/降维/PCA 的理论基础）；②构造 Moore-Penrose 伪逆（K11）；③解病态最小二乘问题；④判断矩阵的条件数（σ_max/σ_min）。",
  concept: [
    "【出发点：AᴴA 是 Hermite 半正定阵】对任意矩阵 A，$A^{H}A$ 一定是 Hermite 半正定阵，因此一定可以酉对角化：$V^{H}(A^{H}A)V=\\operatorname{diag}(\\lambda_1,\\dots,\\lambda_n)$ 且 $\\lambda_i\\ge0$。把这些特征值开平方就得到 A 的**奇异值** $\\sigma_i=\\sqrt{\\lambda_i}$。",
    "【定理2.1.7 的构造思路】设 $\\operatorname{rank}(A)=r>0$，则 A 有奇异值分解 $A=U\\begin{pmatrix}\\Sigma&O\\\\ O&O\\end{pmatrix}V^{H}$，其中 $\\Sigma=\\operatorname{diag}(\\sigma_1,\\dots,\\sigma_r)$，$\\sigma_1\\ge\\sigma_2\\ge\\cdots\\ge\\sigma_r>0$ 是 A 的全部 r 个正奇异值。注意 Σ 的「补零」结构——这正是 SVD 能处理秩亏矩阵的原因。",
    "【U 和 V 怎么求】V 的列是 $A^{H}A$ 的单位正交特征向量（按特征值从大到小排）；求出前 r 个后，用 $U_1=AV_1\\Sigma^{-1}$ 得到 U 的前 r 列，再把 $U_1$ 的列补全成 m 阶酉矩阵就得到完整的 U。",
    "【奇异值的几何意义】SVD 说明：任何线性变换都可以分解为「旋转 → 沿坐标轴伸缩 → 再旋转」三步。奇异值就是各个方向上的伸缩倍数，最大奇异值 $\\sigma_1$ 就是矩阵 2-范数（K03 中 $\\|A\\|_2=\\sqrt{\\lambda_{\\max}(A^{H}A)}=\\sigma_1$）——这就把 K03 的谱范数与 SVD 接了起来。"
  ],
  table: [
    {"概念":"奇异值 σᵢ","来源":"$A^{H}A$ 特征值的算术平方根 $\\sqrt{\\lambda_i}$","个数":"$\\min(m,n)$ 个（其中 r 个为正）"},
    {"概念":"V（右奇异向量）","来源":"$A^{H}A$ 的单位正交特征向量","形状":"$n\\times n$ 酉矩阵"},
    {"概念":"U（左奇异向量）","来源":"前 r 列由 $U_1=AV_1\\Sigma^{-1}$ 得到，再补全","形状":"$m\\times m$ 酉矩阵"},
    {"概念":"Σ","形状":"$m\\times n$ 对角阵，前 r 个对角元为正奇异值","其余":"补零"}
  ],
  formulas: [
    {"tex": "A=U\\begin{pmatrix}\\Sigma&O\\\\ O&O\\end{pmatrix}V^{H},\\qquad \\Sigma=\\operatorname{diag}(\\sigma_1,\\dots,\\sigma_r)", "note": "奇异值分解（定理2.1.7）"},
    {"tex": "\\sigma_i=\\sqrt{\\lambda_i(A^{H}A)}", "note": "奇异值 = AᴴA 特征值的平方根"},
    {"tex": "\\|A\\|_2=\\sigma_1,\\qquad \\|A\\|_{F}=\\sqrt{\\sigma_1^2+\\cdots+\\sigma_r^2}", "note": "与 K03 范数的联系"},
    {"tex": "A=\\sum_{i=1}^{r}\\sigma_i u_i v_i^{H}", "note": "SVD 的外积展开（用于低秩逼近）"}
  ],
  prereq: ["K01", "K03", "K08"],
  serves: ["K11"],
  servesNote: "SVD 是构造 Moore-Penrose 伪逆（K11）的标准工具：$A^{+}=V\\Sigma^{+}U^{H}$，其中 $\\Sigma^{+}$ 是把 Σ 的非零对角元取倒数再转置。同时 SVD 给出的奇异值直接决定矩阵的条件数，是判断问题病态程度的最强判据。",
  examples: [
    {
      title: "例2.1.7（课件 p47-48）：求奇异值分解",
      problem: "求矩阵 $A=\\begin{pmatrix}1&0&1\\\\ 0&1&1\\\\ 0&0&0\\end{pmatrix}$ 的奇异值分解。",
      steps: [
        "先算 $A^{T}A=\\begin{pmatrix}1&0&1\\\\ 0&1&1\\\\ 1&1&2\\end{pmatrix}$",
        "求特征值：$\\det(\\lambda I-A^{T}A)=0$ 得 $\\lambda_1=3,\\ \\lambda_2=1,\\ \\lambda_3=0$",
        "故正奇异值 $\\sigma_1=\\sqrt3,\\ \\sigma_2=1$，$\\Sigma=\\begin{pmatrix}\\sqrt3&0\\\\ 0&1\\end{pmatrix}$（秩为 2，所以 Σ 是 2×2）",
        "求 $A^{T}A$ 对应特征值的单位特征向量：$\\xi_1=[1,1,2]^{T}$，$\\xi_2=[1,-1,0]^{T}$，$\\xi_3=[1,1,-1]^{T}$，单位化后组成 V",
        "由 $U_1=AV_1\\Sigma^{-1}$ 得 $U_1=\\begin{pmatrix}\\frac{\\sqrt2}{2}&\\frac{\\sqrt2}{2}\\\\ \\frac{\\sqrt2}{2}&-\\frac{\\sqrt2}{2}\\\\ 0&0\\end{pmatrix}$，补全成 3 阶正交阵 $U=\\begin{pmatrix}\\frac{\\sqrt2}{2}&\\frac{\\sqrt2}{2}&0\\\\ \\frac{\\sqrt2}{2}&-\\frac{\\sqrt2}{2}&0\\\\ 0&0&1\\end{pmatrix}$",
        "验算 $U^{T}AV=\\operatorname{diag}(\\sqrt3,1,0)$ ✓"
      ],
      answer: "$V=\\begin{pmatrix}\\frac{1}{\\sqrt6}&\\frac{1}{\\sqrt2}&\\frac{1}{\\sqrt3}\\\\ \\frac{1}{\\sqrt6}&-\\frac{1}{\\sqrt2}&\\frac{1}{\\sqrt3}\\\\ \\frac{2}{\\sqrt6}&0&-\\frac{1}{\\sqrt3}\\end{pmatrix}$，$U=\\begin{pmatrix}\\frac{\\sqrt2}{2}&\\frac{\\sqrt2}{2}&0\\\\ \\frac{\\sqrt2}{2}&-\\frac{\\sqrt2}{2}&0\\\\ 0&0&1\\end{pmatrix}$，$\\Sigma=\\operatorname{diag}(\\sqrt3,1)$，即 $A=U\\begin{pmatrix}\\Sigma&O\\\\ O&O\\end{pmatrix}V^{T}$。",
      source: "课件 2.1 p47-48（图片型幻灯片），$U^{T}AV=\\operatorname{diag}(\\sqrt3,1,0)$ 已由 numpy 验算"
    },
    {
      title: "练习（课件 p49）：3×2 矩阵的 SVD",
      problem: "求矩阵 $A=\\begin{pmatrix}2&1\\\\ 0&2\\\\ 1&1\\end{pmatrix}$ 的奇异值分解。<br><b>⚠ 课件此处印错了一个数</b>：这一页的 $A$ 和它自己给出的 $U,\\Sigma,V$ 对不上（详见本题最后一步），把 $A$ 的 $(3,2)$ 元改成 $0$（即 $A=\\begin{pmatrix}2&1\\\\ 0&2\\\\ 1&0\\end{pmatrix}$）后二者才完全自洽。下面按<b>修正后</b>的 $A$ 走完整推导。",
      steps: [
        "计算 $A^{T}A=\\begin{pmatrix}2&0&1\\\\ 1&2&0\\end{pmatrix}\\begin{pmatrix}2&1\\\\ 0&2\\\\ 1&0\\end{pmatrix}=\\begin{pmatrix}5&2\\\\ 2&5\\end{pmatrix}$。<i>若用课件印的 $A$，这里会得到 $\\begin{pmatrix}5&3\\\\ 3&6\\end{pmatrix}$，特征值变成 $\\frac{11\\pm\\sqrt{37}}{2}\\approx8.5414,\\,2.4586$，奇异值是无理数 $2.9226,\\,1.5680$ —— 绝不是课件答案里的 $\\sqrt3,\\sqrt7$。这一步就能发现原题印错了。</i>",
        "特征值：$\\det\\begin{pmatrix}5-\\lambda&2\\\\ 2&5-\\lambda\\end{pmatrix}=(5-\\lambda)^2-4=\\lambda^2-10\\lambda+21=0$，即 $(\\lambda-7)(\\lambda-3)=0$，$\\lambda_1=7,\\ \\lambda_2=3$。（<b>整数特征值</b>——这是好题目的标志，也反过来证明 $(3,2)$ 元应当是 $0$。）",
        "奇异值 $\\sigma_1=\\sqrt7$，$\\sigma_2=\\sqrt3$。$V$ 由 $A^{T}A$ 的单位特征向量组成：$\\lambda=3$ 时 $[1,-1]^{T}/\\sqrt2$，$\\lambda=7$ 时 $[1,1]^{T}/\\sqrt2$。课件把 $\\sigma$ <b>按升序</b>排，所以 $V$ 的两列也相应交换：$V=\\begin{pmatrix}\\frac{1}{\\sqrt2}&\\frac{1}{\\sqrt2}\\\\ -\\frac{1}{\\sqrt2}&\\frac{1}{\\sqrt2}\\end{pmatrix}$，$\\Sigma=\\operatorname{diag}(\\sqrt3,\\sqrt7)$。",
        "由 $u_i=\\frac{1}{\\sigma_i}Av_i$ 求 $U$ 的前两列：$v_1=[\\frac{1}{\\sqrt2},-\\frac{1}{\\sqrt2}]^{T}$ 时 $Av_1=[\\frac{1}{\\sqrt2},-\\frac{2}{\\sqrt2},\\frac{1}{\\sqrt2}]^{T}$，$\\|Av_1\\|=\\sqrt3$，故 $u_1=\\frac{1}{\\sqrt3}[\\frac{1}{\\sqrt2},-\\frac{2}{\\sqrt2},\\frac{1}{\\sqrt2}]^{T}=[\\frac{1}{\\sqrt6},-\\frac{2}{\\sqrt6},\\frac{1}{\\sqrt6}]^{T}$；同理 $v_2=[\\frac{1}{\\sqrt2},\\frac{1}{\\sqrt2}]^{T}$ 时 $Av_2=[\\frac{3}{\\sqrt2},\\frac{2}{\\sqrt2},\\frac{1}{\\sqrt2}]^{T}$，$\\|Av_2\\|=\\sqrt7$，$u_2=[\\frac{3}{\\sqrt{14}},\\frac{2}{\\sqrt{14}},\\frac{1}{\\sqrt{14}}]^{T}$。",
        "第三列 $u_3$ 取与 $u_1,u_2$ 都正交的单位向量，$u_3=[\\frac{2}{\\sqrt{21}},-\\frac{1}{\\sqrt{21}},-\\frac{4}{\\sqrt{21}}]^{T}$（验：$\\|u_3\\|=1$；$u_1^{T}u_3=\\frac{2+2-4}{\\sqrt{126}}=0$；$u_2^{T}u_3=\\frac{6-2-4}{\\sqrt{294}}=0$ ✓）。"
      ],
      answer: "$U=\\begin{pmatrix}\\frac{1}{\\sqrt6}&\\frac{3}{\\sqrt{14}}&\\frac{2}{\\sqrt{21}}\\\\ -\\frac{2}{\\sqrt6}&\\frac{2}{\\sqrt{14}}&-\\frac{1}{\\sqrt{21}}\\\\ \\frac{1}{\\sqrt6}&\\frac{1}{\\sqrt{14}}&-\\frac{4}{\\sqrt{21}}\\end{pmatrix}$（3×3，正交），$V=\\begin{pmatrix}\\frac{1}{\\sqrt2}&\\frac{1}{\\sqrt2}\\\\ -\\frac{1}{\\sqrt2}&\\frac{1}{\\sqrt2}\\end{pmatrix}$（2×2，正交），$\\Sigma=\\begin{pmatrix}\\sqrt3&0\\\\ 0&\\sqrt7\\\\ 0&0\\end{pmatrix}$（3×2，<b>下边必须补一行零</b>，否则 $U\\Sigma V^{T}$ 的尺寸对不上）。<br><b>回代验算</b>：$U\\Sigma V^{T}=\\begin{pmatrix}2&1\\\\ 0&2\\\\ 1&0\\end{pmatrix}=A$ ✓。<br><b>为什么说课件印错了</b>：用课件印的 $A=\\begin{pmatrix}2&1\\\\ 0&2\\\\ 1&1\\end{pmatrix}$ 回代，得到的是 $\\begin{pmatrix}2&1\\\\ 0&2\\\\ 1&0\\end{pmatrix}$，第 3 行第 2 列应该等于 $1$ 却算成了 $0$；而它的奇异值应为 $2.9226,1.5680$，与给定的 $\\sqrt3,\\sqrt7$ 完全不符。反过来说，$U,V,\\Sigma$ 三者<b>互相完全自洽</b>（$U$ 正交、$V$ 正交、$Av_i=\\sigma_iu_i$ 逐列成立），所以错的是 $A$ 里那一个数，不是答案。",
      source: "课件 2.1 p49（图片型幻灯片，已 1000dpi 放大逐字确认印的是 $\\begin{smallmatrix}2&1\\\\ 0&2\\\\ 1&1\\end{smallmatrix}$）；<b>该页 $A$ 的 $(3,2)$ 元印错，应为 0</b>，本页按修正后的 $A$ 给出完整推导，答案 $U,V,\\Sigma$ 与课件一致"
    },
    {
      title: "补充例（由 numpy 生成并验算）：对称阵的 SVD",
      problem: "求 $A=\\begin{pmatrix}2&-1&0\\\\ -1&2&0\\\\ 0&0&-2\\end{pmatrix}$ 的奇异值。",
      steps: [
        "A 是对称矩阵，对称矩阵的奇异值等于其特征值的绝对值",
        "求特征值：分块计算，前 2×2 块 $\\begin{pmatrix}2&-1\\\\ -1&2\\end{pmatrix}$ 的特征值为 $2\\mp1$ 即 1 和 3；右下角独立给出 $-2$",
        "故特征值为 $3,1,-2$",
        "取绝对值即得奇异值"
      ],
      answer: "奇异值为 $3,\\ 2,\\ 1$（numpy 验算确认）。这题的关键结论：**对称（更一般地，正规）矩阵的奇异值就是特征值的绝对值**——因为此时 $A^{H}A=A^2$，特征值平方后再开方就回到 $|\\lambda|$。",
      source: "原创（按 K10 知识点设计，答案经 numpy 验算）"
    },
    {
      title: "补充例（由 numpy 生成并验算）：含块对角结构的 SVD",
      problem: "求 $A=\\begin{pmatrix}6&0&0\\\\ 0&-2&3\\\\ 0&3&-2\\end{pmatrix}$ 的奇异值。",
      steps: [
        "分块：左上角独立给出 $6$；右下 2×2 块 $B=\\begin{pmatrix}-2&3\\\\ 3&-2\\end{pmatrix}$",
        "$B$ 的特征值：$\\det(B-\\lambda I)=(-2-\\lambda)^2-9=0$，得 $\\lambda=-2\\pm3$，即 $1$ 和 $-5$",
        "A 的特征值为 $6,-5,1$（$B$ 与 6 互不影响，因为分块对角）",
        "取绝对值"
      ],
      answer: "奇异值为 $6,\\ 5,\\ 1$（numpy 验算确认）。$\\|A\\|_2=\\sigma_1=6$，$\\|A\\|_F=\\sqrt{36+25+1}=\\sqrt{62}$。",
      source: "原创（按 K10 知识点设计，答案经 numpy 验算）"
    },
    {
      title: "概念例：SVD 与矩阵的秩、2-范数",
      problem: "设 $A$ 的奇异值为 $\\sigma_1\\ge\\sigma_2\\ge\\cdots\\ge\\sigma_r>0$（$r$ 个正奇异值）。请写出 $\\operatorname{rank}(A)$、$\\|A\\|_2$、$\\|A\\|_F$ 各自等于什么。",
      steps: [
        "$A=U\\Sigma V^{H}$，U、V 都是可逆（酉）矩阵，不改变秩",
        "故 $\\operatorname{rank}(A)=\\operatorname{rank}(\\Sigma)=$ 非零奇异值个数 $=r$",
        "$\\|A\\|_2=\\max_{\\|x\\|_2=1}\\|Ax\\|_2=\\sigma_1$（最大伸缩倍数）",
        "$\\|A\\|_F^2=\\operatorname{tr}(A^{H}A)=\\sum\\lambda_i(A^{H}A)=\\sum\\sigma_i^2$"
      ],
      answer: "$\\operatorname{rank}(A)=r$（正奇异值的个数）；$\\|A\\|_2=\\sigma_1$；$\\|A\\|_F=\\sqrt{\\sigma_1^2+\\cdots+\\sigma_r^2}$。这组等式把 K03 的范数、矩阵的秩和 SVD 三者统一起来了，是本章最该背下来的结论。",
      source: "原创（按 K10 知识点设计，联系 K03）"
    },
    {
      title: "补充例：用 SVD 做低秩逼近",
      problem: "设 $A=\\sigma_1u_1v_1^{H}+\\sigma_2u_2v_2^{H}+\\sigma_3u_3v_3^{H}$，$\\sigma_1>\\sigma_2>\\sigma_3>0$。若想用秩 1 矩阵最佳逼近 A（在 2-范数或 F-范数意义下），应取什么？",
      steps: [
        "把 SVD 写成外积展开 $A=\\sum_{i=1}^{r}\\sigma_iu_iv_i^{H}$",
        "每一项 $\\sigma_iu_iv_i^{H}$ 都是秩 1 矩阵，且系数 $\\sigma_i$ 递减",
        "截断到前 k 项，误差为被丢弃的奇异值"
      ],
      answer: "取 $A_1=\\sigma_1u_1v_1^{H}$。这就是 **Eckart-Young 定理**：秩 k 最佳逼近就是保留前 k 个最大奇异值对应的项。误差在 2-范数下为 $\\sigma_{k+1}$，在 F-范数下为 $\\sqrt{\\sigma_{k+1}^2+\\cdots+\\sigma_r^2}$。这是图像压缩、PCA 降维、推荐系统的共同理论基础。",
      source: "原创（按 K10 知识点设计）"
    }
  ],
  quiz: [
    {"type":"choice","q":"设 $A$ 是 $5\\times3$ 矩阵，则其奇异值的个数是：","options":["5 个","3 个","8 个","等于 rank(A)"], "answer":1,"explain":"奇异值个数为 $\\min(m,n)=\\min(5,3)=3$。其中**正**奇异值的个数才等于秩。注意区分「奇异值总数」和「正奇异值个数」。"},
    {"type":"choice","q":"$A=\\begin{pmatrix}2&-1&0\\\\ -1&2&0\\\\ 0&0&-2\\end{pmatrix}$ 的最大奇异值是：","options":["1","2","3","$\\sqrt6$"],"answer":2,"explain":"A 对称，奇异值 = 特征值绝对值。特征值为 1、3、−2，所以奇异值为 1、3、2，最大是 3。同时这也等于 $\\|A\\|_2$。"},
    {"type":"choice","q":"设 $A$ 的奇异值为 $3,2,1$，则 $\\|A\\|_{F}$ 等于：","options":["$\\sqrt{14}$","$6$","$14$","$\\sqrt{6}$"],"answer":0,"explain":"$\\|A\\|_F=\\sqrt{\\sigma_1^2+\\sigma_2^2+\\sigma_3^2}=\\sqrt{9+4+1}=\\sqrt{14}$，这是 Frobenius 范数与奇异值的标准关系式。$14$ 是平方和忘了开方；$6=3+2+1$ 是奇异值直接相加；$\\sqrt6=\\sqrt{3+2+1}$ 是把奇异值本身当成了平方项。"},
    {"type":"choice","q":"求 $A$ 的奇异值分解时，$V$ 的列是下列哪个矩阵的单位正交特征向量：","options":["$AA^{H}$","$A^{H}A$","$A$ 本身","$A+A^{H}$"],"answer":1,"explain":"SVD 的构造从 $A^{H}A$ 出发：它必为 Hermite 半正定阵，可酉对角化，其单位正交特征向量按特征值从大到小排成 $V$，特征值开方即得奇异值 $\\sigma_i=\\sqrt{\\lambda_i}$。$AA^{H}$ 的特征向量给的是**左**奇异向量（$U$ 的列），不要与 $V$ 混；$A$ 未必是方阵，也未必可对角化。"},
    {"type":"choice","q":"设 $A=\\sigma_1u_1v_1^{H}+\\sigma_2u_2v_2^{H}+\\sigma_3u_3v_3^{H}$，$\\sigma_1>\\sigma_2>\\sigma_3>0$，则在 2-范数意义下 $A$ 的最佳秩 1 逼近是：","options":["$\\sigma_3u_3v_3^{H}$","$\\sigma_1u_1v_1^{H}+\\sigma_2u_2v_2^{H}$","$\\sigma_1u_1v_1^{H}$","$(\\sigma_1+\\sigma_2+\\sigma_3)u_1v_1^{H}$"],"answer":2,"explain":"这就是 Eckart-Young 定理：秩 $k$ 最佳逼近就是保留前 $k$ 个最大奇异值对应的项，$k=1$ 时取 $A_1=\\sigma_1u_1v_1^{H}$，其 2-范数误差为 $\\sigma_2$、F-范数误差为 $\\sqrt{\\sigma_2^2+\\sigma_3^2}$。取**最小**奇异值那一项显然不对；$\\sigma_1u_1v_1^{H}+\\sigma_2u_2v_2^{H}$ 是秩 2 的截断，根本不是秩 1 矩阵；把三个奇异值相加去缩放一个秩 1 项，既不是 $A$ 的截断，也不是最佳逼近。"},
    {"type":"choice","q":"对任意矩阵 $A$，$A^{H}A$ 一定是：","options":["Hermite 正定矩阵，因而必可逆","对称矩阵，但可能不可对角化","幂等矩阵，即 $(A^{H}A)^{2}=A^{H}A$","Hermite 半正定矩阵，必可酉对角化且特征值全为非负实数"],"answer":3,"explain":"$(A^{H}A)^{H}=A^{H}A$，故它是 Hermite 阵；又对任意 $x$ 有 $x^{H}A^{H}Ax=\\|Ax\\|_2^{2}\\ge0$，故半正定，特征值 $\\lambda_i\\ge0$ 且必可酉对角化——这正是奇异值 $\\sigma_i=\\sqrt{\\lambda_i}$ 的定义基础。它只在 $A$ 列满秩时才正定可逆（$A=O$ 时 $A^{H}A=O$ 就不可逆），所以说「正定」过强；Hermite 阵必可酉对角化，第二项与之矛盾；$(A^{H}A)^{2}=A^{H}A$ 一般也不成立。"},
    {"type":"choice","q":"设 $A$ 的正奇异值为 $\\sigma_1\\ge\\cdots\\ge\\sigma_r>0$，则 $\\|A\\|_{2}$ 等于：","options":["$\\sigma_1$","$\\sigma_r$","$\\sqrt{\\sigma_1^2+\\cdots+\\sigma_r^2}$","$\\sigma_1/\\sigma_r$"],"answer":0,"explain":"SVD 的几何意义是「旋转—沿坐标轴伸缩—再旋转」，$\\sigma_1$ 就是最大伸缩倍数，即 $\\|A\\|_2=\\max_{\\|x\\|_2=1}\\|Ax\\|_2=\\sigma_1$，也等于 $\\sqrt{\\lambda_{\\max}(A^{H}A)}$——这把 K03 的谱范数与 SVD 接了起来。第三个选项是 Frobenius 范数 $\\|A\\|_F$；$\\sigma_r$ 是最小伸缩倍数；$\\sigma_1/\\sigma_r$ 是条件数。"},
    {"type":"choice","q":"设 $A$ 是 $3\\times2$ 矩阵且 $\\operatorname{rank}(A)=2$，其 SVD 为 $A=U\\Sigma V^{H}$，则 $\\Sigma$ 的形状与内容是：","options":["$2\\times2$，$\\Sigma=\\operatorname{diag}(\\sigma_1,\\sigma_2)$","$3\\times3$，$\\Sigma=\\operatorname{diag}(\\sigma_1,\\sigma_2,0)$","$2\\times3$，$\\Sigma=\\begin{pmatrix}\\sigma_1&0&0\\\\ 0&\\sigma_2&0\\end{pmatrix}$","$3\\times2$，$\\Sigma=\\begin{pmatrix}\\sigma_1&0\\\\ 0&\\sigma_2\\\\ 0&0\\end{pmatrix}$（下边补一行零）"],"answer":3,"explain":"$\\Sigma$ 与 $A$ 同形状，是 $m\\times n=3\\times2$；前 $r=2$ 个对角元是正奇异值，多出来的那一**行**必须补零，否则 $U\\Sigma V^{H}$ 的尺寸对不上（这里 $U$ 是 $3\\times3$、$V$ 是 $2\\times2$）。$2\\times2$ 少了补零、$3\\times3$ 把对角元的个数当成了 $3$、$2\\times3$ 是转置形状，三者都无法满足 $A=U\\Sigma V^{H}$。"},
  ],
  faq: [
    {"q":"为什么 SVD 里 Σ 的右下角要补零？","a":"因为 Σ 是 $m\\times n$ 的（跟 A 同形状），而对角元只有 $r=\\operatorname{rank}(A)$ 个是正的，剩下位置必须填 0。举例：$3\\times3$ 矩阵秩为 2 时，$\\Sigma=\\operatorname{diag}(\\sigma_1,\\sigma_2,0)$；若 A 是 $3\\times2$ 秩 2，则 Σ 是 $3\\times2$，形如 $\\begin{pmatrix}\\sigma_1&0\\\\ 0&\\sigma_2\\\\ 0&0\\end{pmatrix}$。补零结构正是 SVD 能统一处理秩亏、长方形矩阵的关键。"},
    {"q":"求 V 的时候特征向量怎么排序？符号怎么定？","a":"必须按特征值**从大到小**排，这样对应的奇异值 $\\sigma_1\\ge\\sigma_2\\ge\\cdots$ 才有序。符号（正负）是不唯一的——特征向量乘 −1 仍是特征向量，所以 V 的某列整体变号、U 对应列也变号，乘积不变。做题时按标准答案的符号取即可，阅卷不会因符号不同判错，但**排序必须对**。"},
    {"q":"怎么快速检查 SVD 算对了？","a":"三个快速自检：①把求出的奇异值平方，看是不是恰好等于 $A^{H}A$ 的特征值；②检查 $\\sigma_1\\ge\\sigma_2\\ge\\cdots$ 是否递减；③正奇异值的个数应当等于 $\\operatorname{rank}(A)$。如果秩算出来不对，八成是特征值求解或排序出了问题。"}
  ]
},
{
  id: "K11",
  title: "广义逆矩阵（伪逆）",
  module: "矩阵分解与广义逆",
  level: 11,
  importance: "core",
  stars: 3,
  summary: "当矩阵不可逆（长方形或奇异）时，用满足部分或全部 Penrose 方程的矩阵 A⁺ 代替逆矩阵，使 Ax=b 仍有「最佳近似解」可言。",
  why: "现实问题里遇到的矩阵大多不可逆——数据比未知数多（超定）或比未知数少（欠定）。广义逆让「求解 Ax=b」在不可逆时依然有意义：它给出最小二乘意义下的最优解，或范数最小的解。它服务于：①最小二乘拟合与回归；②求解不相容线性方程组；③SVD 分解后的投影与降维；④统计学中的帽子矩阵。<br><b>大纲定位</b>：中国科学院大学《矩阵论》把「广义逆矩阵」单列为第六章，<b>8 学时</b>；赣南师范大学《矩阵分析》单列第 6 章，<b>6 学时</b>——占两校总学时的 11%~13%。两份大纲都把它排在「矩阵分解」之后，是硬依赖。因此它是<b>核心·必考</b>，不能因为本课课件没展开就轻视。",
  concept: [
    "【为什么需要广义逆】普通逆矩阵 $A^{-1}$ 要求 A 是方阵且可逆。但工程问题里 A 常常是 $m\\times n$（$m\\ne n$）的：例如用 100 组数据拟合 3 个参数，方程组超定、无精确解。这时我们希望找一个 x 使 $\\|Ax-b\\|$ 最小——广义逆就是为这类问题设计的。",
    "【Penrose 四个方程】设 $A\\in C^{m\\times n}$，若 $X\\in C^{n\\times m}$ 满足以下四个方程：①$AXA=A$；②$XAX=X$；③$(AX)^{H}=AX$；④$(XA)^{H}=XA$，则称 X 为 A 的 **Moore-Penrose 逆**，记作 $A^{+}$，且满足四条的 $A^{+}$ **存在且唯一**。",
    "【只满足部分方程的所谓「弱广义逆」】只满足①的叫 {1}-逆，记 $A^{-}$；满足①②的叫 {1,2}-逆；满足①②③④的才是 $A^{+}$。{1}-逆不唯一（通常有无穷多个），$A^{+}$ 唯一。做题时看清题目问的是哪一种——这是最容易失分的地方。",
    "【用满秩分解或 SVD 构造】①若 $A=FG$（K09 的满秩分解），则 $G^{-1}F^{-1}$（单侧逆）是 A 的一个 {1}-逆。②$A^{+}=V\\Sigma^{+}U^{H}$，其中 $\\Sigma^{+}$ 是把 Σ 中非零对角元取倒数、再转置得到的 $n\\times m$ 矩阵。第三种情形最常用：A 列满秩时 $A^{+}=(A^{H}A)^{-1}A^{H}$；A 行满秩时 $A^{+}=A^{H}(AA^{H})^{-1}$。"
  ],
  table: [
    {"名称":"{1}-逆 A⁻","满足方程":"① AXA=A","唯一性":"不唯一"},
    {"名称":"{1,2}-逆","满足方程":"① ② ","唯一性":"一般不唯一"},
    {"名称":"Moore-Penrose 逆 A⁺","满足方程":"① ② ③ ④ 全满足","唯一性":"存在且唯一"},
    {"名称":"A 列满秩","A⁺ 公式":"$(A^{H}A)^{-1}A^{H}$","性质":"左逆：$A^{+}A=I$"},
    {"名称":"A 行满秩","A⁺ 公式":"$A^{H}(AA^{H})^{-1}$","性质":"右逆：$AA^{+}=I$"}
  ],
  formulas: [
    {"tex": "AXA=A,\\quad XAX=X,\\quad (AX)^{H}=AX,\\quad (XA)^{H}=XA", "note": "Penrose 四个方程（全部满足才是 A⁺）"},
    {"tex": "A^{+}=V\\Sigma^{+}U^{H}", "note": "用 SVD 构造伪逆（Σ⁺ 把非零奇异值取倒数并转置）"},
    {"tex": "A^{+}=(A^{H}A)^{-1}A^{H}\\ \\ (A\\text{ 列满秩})", "note": "列满秩时的左逆，对应超定最小二乘"},
    {"tex": "x=A^{+}b=\\arg\\min_{x}\\|Ax-b\\|_{2}", "note": "不相容方程组的最小二乘解"}
  ],
  prereq: ["K09", "K10"],
  serves: [],
  servesNote: "广义逆是本课程的收口知识点——它把前面所有分解（三角、正交、满秩、SVD）都当成工具来用，本身不再服务于后续章节。它是「矩阵分解」这条线的终点。",
  examples: [
    {
      title: "例：列满秩矩阵的伪逆",
      problem: "设 $A=\\begin{pmatrix}1&0\\\\ 0&1\\\\ 1&1\\end{pmatrix}$，求 $A^{+}$。",
      steps: [
        "$A$ 是 $3\\times2$，两列线性无关（不成比例），故列满秩，用公式 $A^{+}=(A^{T}A)^{-1}A^{T}$",
        "$A^{T}A=\\begin{pmatrix}1&0&1\\\\ 0&1&1\\end{pmatrix}\\begin{pmatrix}1&0\\\\ 0&1\\\\ 1&1\\end{pmatrix}=\\begin{pmatrix}2&1\\\\ 1&2\\end{pmatrix}$",
        "$(A^{T}A)^{-1}=\\frac{1}{3}\\begin{pmatrix}2&-1\\\\ -1&2\\end{pmatrix}$",
        "$A^{+}=\\frac13\\begin{pmatrix}2&-1\\\\ -1&2\\end{pmatrix}\\begin{pmatrix}1&0&1\\\\ 0&1&1\\end{pmatrix}=\\frac13\\begin{pmatrix}2&-1&1\\\\ -1&2&1\\end{pmatrix}$",
        "验算 $A^{+}A=I_2$ ✓"
      ],
      answer: "$A^{+}=\\frac13\\begin{pmatrix}2&-1&1\\\\ -1&2&1\\end{pmatrix}$，且 $A^{+}A=I_2$（左逆）。",
      source: "第2章课件未覆盖广义逆（2.2/2.3 只有目录项），本例按通用《矩阵论》大纲补写"
    },
    {
      title: "例：用 SVD 构造伪逆",
      problem: "设 $A=\\begin{pmatrix}1&0&1\\\\ 0&1&1\\\\ 0&0&0\\end{pmatrix}$（例2.1.7 的矩阵），已知其奇异值为 $\\sqrt3,1$，求 $A^{+}$。",
      steps: [
        "由例2.1.7，$A=U\\begin{pmatrix}\\Sigma&O\\\\ O&O\\end{pmatrix}V^{T}$，$\\Sigma=\\operatorname{diag}(\\sqrt3,1)$",
        "把 Σ 的非零对角元取倒数：$\\Sigma^{+}=\\operatorname{diag}(\\frac{1}{\\sqrt3},1)$",
        "$\\Sigma^{+}$ 要转置成 $3\\times3$ 并补零：$\\Sigma^{+}_{3\\times3}=\\begin{pmatrix}\\frac{1}{\\sqrt3}&0&0\\\\ 0&1&0\\\\ 0&0&0\\end{pmatrix}$",
        "$A^{+}=V\\Sigma^{+}U^{T}$"
      ],
      answer: "$A^{+}=V\\begin{pmatrix}\\frac{1}{\\sqrt3}&0&0\\\\ 0&1&0\\\\ 0&0&0\\end{pmatrix}U^{T}$，其中 V、U 取自例2.1.7。注意关键规则：**Σ⁺ 中对应的零奇异值位置取 0（不是取无穷大）**——这正是伪逆能处理秩亏的原因。",
      source: "第2章课件未覆盖，按通用大纲补写（与 K10 例2.1.7 联动）"
    },
    {
      title: "概念例：为什么 {1}-逆不唯一",
      problem: "设 $A=\\begin{pmatrix}1&0\\\\ 0&0\\end{pmatrix}$，求 A 的一个 {1}-逆，并说明它为什么不唯一。",
      steps: [
        "{1}-逆要求 $AXA=A$",
        "设 $X=\\begin{pmatrix}a&b\\\\ c&d\\end{pmatrix}$，则 $AXA=\\begin{pmatrix}1&0\\\\ 0&0\\end{pmatrix}\\begin{pmatrix}a&b\\\\ c&d\\end{pmatrix}\\begin{pmatrix}1&0\\\\ 0&0\\end{pmatrix}=\\begin{pmatrix}a&0\\\\ 0&0\\end{pmatrix}$",
        "要求它等于 A，只需 $a=1$；b、c、d 任意"
      ],
      answer: "例如 $X=\\begin{pmatrix}1&0\\\\ 0&0\\end{pmatrix}$、$X=\\begin{pmatrix}1&5\\\\ 7&9\\end{pmatrix}$ 都是 A 的 {1}-逆。因为条件 $AXA=A$ 只约束了 X 的一个元素，其余自由，所以 {1}-逆**有无穷多个**。而 Moore-Penrose 逆 $A^{+}$ 要求四条全满足，被唯一确定：$A^{+}=\\begin{pmatrix}1&0\\\\ 0&0\\end{pmatrix}$。",
      source: "原创（按 K11 知识点设计）"
    },
    {
      title: "例：超定方程组的最小二乘解",
      problem: "用广义逆求方程组 $\\begin{cases}x_1=1\\\\ x_2=2\\\\ x_1+x_2=4\\end{cases}$ 的最小二乘解。",
      steps: [
        "写成矩阵形式 $Ax=b$，$A=\\begin{pmatrix}1&0\\\\ 0&1\\\\ 1&1\\end{pmatrix}$，$b=\\begin{pmatrix}1\\\\ 2\\\\ 4\\end{pmatrix}$",
        "A 列满秩，$A^{+}=\\frac13\\begin{pmatrix}2&-1&1\\\\ -1&2&1\\end{pmatrix}$（见上面例题）",
        "$x=A^{+}b=\\frac13\\begin{pmatrix}2&-1&1\\\\ -1&2&1\\end{pmatrix}\\begin{pmatrix}1\\\\ 2\\\\ 4\\end{pmatrix}=\\frac13\\begin{pmatrix}2-2+4\\\\ -1+4+4\\end{pmatrix}=\\frac13\\begin{pmatrix}4\\\\ 7\\end{pmatrix}$",
        "验算残差：$Ax=\\frac13\\begin{pmatrix}4\\\\ 7\\\\ 11\\end{pmatrix}$，$\\|Ax-b\\|=\\|[\\frac13,\\frac13,-\\frac13]^{T}\\|=\\frac{\\sqrt3}{3}$，已是最小"
      ],
      answer: "$x=\\begin{pmatrix}4/3\\\\ 7/3\\end{pmatrix}$。方程组本身无精确解（三个方程只有两个未知数且不相容），广义逆给出的正是使 $\\|Ax-b\\|_2$ 最小的解。",
      source: "原创（按 K11 知识点设计）"
    },
    {
      title: "例：行满秩矩阵的伪逆（与列满秩对照）",
      problem: "设 $A=\\begin{pmatrix}1&0&1\\\\ 0&1&1\\end{pmatrix}$（2×3，行满秩），求 $A^{+}$。",
      steps: [
        "先判断满秩方向：$A$ 是 2×3，两行线性无关（不成比例），所以是**行满秩**，要用公式 $A^{+}=A^{H}(AA^{H})^{-1}$",
        "算 $AA^{T}=\\begin{pmatrix}1&0&1\\\\ 0&1&1\\end{pmatrix}\\begin{pmatrix}1&0\\\\ 0&1\\\\ 1&1\\end{pmatrix}=\\begin{pmatrix}2&1\\\\ 1&2\\end{pmatrix}$",
        "$(AA^{T})^{-1}=\\frac13\\begin{pmatrix}2&-1\\\\ -1&2\\end{pmatrix}$",
        "$A^{+}=A^{T}(AA^{T})^{-1}=\\begin{pmatrix}1&0\\\\ 0&1\\\\ 1&1\\end{pmatrix}\\cdot\\frac13\\begin{pmatrix}2&-1\\\\ -1&2\\end{pmatrix}=\\frac13\\begin{pmatrix}2&-1\\\\ -1&2\\\\ 1&1\\end{pmatrix}$",
        "验算右侧：$AA^{+}=\\frac13\\begin{pmatrix}3&0\\\\ 0&3\\end{pmatrix}=I_2$ ✓"
      ],
      answer: "$A^{+}=\\frac13\\begin{pmatrix}2&-1\\\\ -1&2\\\\ 1&1\\end{pmatrix}$，且 $AA^{+}=I_2$（**右逆**）。<br>对照记忆：<b>列满秩用左逆 $(A^{H}A)^{-1}A^{H}$，行满秩用右逆 $A^{H}(AA^{H})^{-1}$</b>——谁满秩，就把谁放到「被求逆」的乘积位置上。",
      source: "原创（按 K11 知识点设计，答案经 numpy 验算）"
    },
    {
      title: "例：用满秩分解构造 {1}-逆",
      problem: "设 $A=\\begin{pmatrix}1&2\\\\ 2&4\\end{pmatrix}$（秩为 1），利用满秩分解求 $A$ 的一个 {1}-逆，并说明它为什么不唯一。",
      steps: [
        "先做满秩分解：$A$ 的两列成比例，秩 $r=1$。取 $F=\\begin{pmatrix}1\\\\ 2\\end{pmatrix}$（列满秩），$G=\\begin{pmatrix}1&2\\end{pmatrix}$（行满秩），则 $A=FG$ ✓",
        "F 是 2×1 列满秩，其左逆 $F_L^{-1}=(F^{T}F)^{-1}F^{T}=\\frac15\\begin{pmatrix}1&2\\end{pmatrix}$",
        "G 是 1×2 行满秩，其右逆 $G_R^{-1}=G^{T}(GG^{T})^{-1}=\\frac15\\begin{pmatrix}1\\\\ 2\\end{pmatrix}$",
        "取 $X=G_R^{-1}F_L^{-1}=\\frac15\\begin{pmatrix}1\\\\ 2\\end{pmatrix}\\cdot\\frac15\\begin{pmatrix}1&2\\end{pmatrix}=\\frac{1}{25}\\begin{pmatrix}1&2\\\\ 2&4\\end{pmatrix}$",
        "验证 $AXA=A$：$AX=\\frac15\\begin{pmatrix}1&2\\\\ 2&4\\end{pmatrix}$，再右乘 $A$ 得 $\\begin{pmatrix}1&2\\\\ 2&4\\end{pmatrix}=A$ ✓"
      ],
      answer: "$A^{-}=\\frac{1}{25}\\begin{pmatrix}1&2\\\\ 2&4\\end{pmatrix}$ 是 $A$ 的一个 {1}-逆。<br><b>它不唯一</b>：例如 $\\begin{pmatrix}1&0\\\\ 0&0\\end{pmatrix}$ 也满足 $AXA=A$。因为 {1}-逆只要求 $AXA=A$ 这一条，对 2×2 的 X 只构成 4 个方程约束 4 个未知数、且 $A$ 秩亏导致约束不满秩，所以解集是一个正维数的仿射集——有无穷多个。这也正是要引入 Moore-Penrose 逆的原因：加上对称性条件 ③④ 后解才唯一。",
      source: "原创（按 K11 知识点设计，答案经 numpy 验算）"
    }
  ],
  quiz: [
    {"type":"choice","q":"Moore-Penrose 逆 $A^{+}$ 必须满足的 Penrose 方程共有几个？","options":["1 个","2 个","3 个","4 个"],"answer":3,"explain":"四个：①$AXA=A$ ②$XAX=X$ ③$(AX)^{H}=AX$ ④$(XA)^{H}=XA$。全部满足才叫 Moore-Penrose 逆，且此时解唯一。只满足①的只叫 {1}-逆。"},
    {"type":"choice","q":"当 $A$ 列满秩时，$A^{+}$ 等于：","options":["$A^{H}(AA^{H})^{-1}$","$(A^{H}A)^{-1}A^{H}$","$A^{-1}$","$A^{H}$"],"answer":1,"explain":"列满秩时 $A^{H}A$ 可逆，$A^{+}=(A^{H}A)^{-1}A^{H}$，它是**左逆**（$A^{+}A=I$）。行满秩时才是 $A^{+}=A^{H}(AA^{H})^{-1}$（右逆）。这两个公式极易混，记法：谁满秩就把谁放到「被求逆」的位置上。"},
    {"type":"choice","q":"若 $A$ 的奇异值分解为 $A=U\\Sigma V^{H}$，则 $A^{+}$ 等于：","options":["$U\\Sigma^{+}V^{H}$","$V^{H}\\Sigma^{+}U$","$V\\Sigma^{+}U^{H}$","$U^{H}\\Sigma^{+}V$"],"answer":2,"explain":"规则是：把 $\\Sigma$ 中非零对角元取倒数、零元保持为零，再转置得到 $\\Sigma^{+}$，而左右两个酉因子**位置互换**（并取共轭转置），即 $A^{+}=V\\Sigma^{+}U^{H}$。记忆法：$A$ 里 $U$ 在左、$V$ 在右，取伪逆后 $V$ 跑到左边、$U$ 跑到右边，指数上的 $H$ 也跟着换到原来在另一侧的那个因子上。"},
    {"type":"choice","q":"设 $A=\\begin{pmatrix}1&0\\\\ 0&0\\end{pmatrix}$，则 $A^{+}$ 等于：","options":["$\\begin{pmatrix}1&0\\\\ 0&0\\end{pmatrix}$","$\\begin{pmatrix}0&0\\\\ 0&1\\end{pmatrix}$","$\\begin{pmatrix}1&0\\\\ 0&1\\end{pmatrix}$","$\\begin{pmatrix}0&1\\\\ 1&0\\end{pmatrix}$"],"answer":0,"explain":"取 $X=A$ 逐条验证四个 Penrose 方程：$AXA=A$ ✓；$XAX=X$ ✓；$AX=A$ 是对称阵，故 $(AX)^{H}=AX$ ✓；$XA=A$ 同理 ✓。四条全满足，而满足四条的 $A^{+}$ **存在且唯一**，所以 $A^{+}=A$。这题也说明：对称幂等阵的伪逆就是它自己——$A$ 本身不可逆，不能用 $(A^{H}A)^{-1}A^{H}$。（已由 sympy 的 pinv 复核。）"},
    {"type":"choice","q":"方程组 $\\begin{cases}x_1=1\\\\ x_2=2\\\\ x_1+x_2=4\\end{cases}$ 的最小二乘解（即 $\\arg\\min_x\\|Ax-b\\|_2$）是：","options":["$x=\\begin{pmatrix}1\\\\ 2\\end{pmatrix}$","$x=\\begin{pmatrix}7/3\\\\ 4/3\\end{pmatrix}$","$x=\\begin{pmatrix}3/2\\\\ 3/2\\end{pmatrix}$","$x=\\begin{pmatrix}4/3\\\\ 7/3\\end{pmatrix}$"],"answer":3,"explain":"写成 $Ax=b$ 后 $A=\\begin{pmatrix}1&0\\\\ 0&1\\\\ 1&1\\end{pmatrix}$ 列满秩，$A^{+}=\\frac13\\begin{pmatrix}2&-1&1\\\\ -1&2&1\\end{pmatrix}$，故 $x=A^{+}b=\\frac13\\begin{pmatrix}4\\\\ 7\\end{pmatrix}$。复算残差：$\\|Ax-b\\|_2=\\frac{\\sqrt3}{3}\\approx0.577$；而 $(1,2)$ 的残差为 $1$、$(7/3,4/3)$ 为 $1.528$、$(3/2,3/2)$ 为 $1.225$，都更大。注意 $(1,2)$ 恰好满足前两个方程，只把第三个方程的偏差留下了——那是「部分满足」，不是「最小二乘」。"},
    {"type":"choice","q":"关于 {1}-逆 $A^{-}$ 与 Moore-Penrose 逆 $A^{+}$，下列说法正确的是：","options":["两者都存在且唯一","{1}-逆通常有无穷多个，而 $A^{+}$ 存在且唯一","{1}-逆唯一，$A^{+}$ 有无穷多个","两者都不唯一，必须再补充条件才能确定"],"answer":1,"explain":"{1}-逆只要求满足 $AXA=A$ 这一条，约束很少——例如 $A=\\begin{pmatrix}1&0\\\\ 0&0\\end{pmatrix}$ 时它只约束 $X$ 的一个元素，其余三个自由，故 {1}-逆一般有无穷多个；而四条 Penrose 方程全满足的 $A^{+}$ **存在且唯一**。正因为弱广义逆不唯一、答案无法核对，题目说「求广义逆」而未指明种类时通常默认求 $A^{+}$。"},
    {"type":"choice","q":"若 $A=FG$ 是 $A$ 的满秩分解（$F$ 列满秩、$G$ 行满秩），则由单侧逆写出的 $G^{-1}F^{-1}$ 是 $A$ 的一个：","options":["Moore-Penrose 逆 $A^{+}$","普通逆矩阵 $A^{-1}$","{1}-逆（即满足 $AXA=A$ 的 $A^{-}$）","正交投影矩阵"],"answer":2,"explain":"$F$ 列满秩故有左逆 $F^{-1}$，$G$ 行满秩故有右逆 $G^{-1}$，取 $X=G^{-1}F^{-1}$ 立刻得 $AXA=FG\\cdot G^{-1}F^{-1}\\cdot FG=FG=A$，所以它是 $A$ 的一个 {1}-逆。它一般不满足其余三个 Penrose 方程，因此不等于 $A^{+}$；$A$ 不满秩时 $A^{-1}$ 根本不存在；投影矩阵是幂等的方阵，与这里 $n\\times m$ 的广义逆不是一类对象。"},
    {"type":"choice","q":"设 $A=\\begin{pmatrix}1&2\\\\ 2&4\\end{pmatrix}$，取满秩分解中的 $F=\\begin{pmatrix}1\\\\ 2\\end{pmatrix}$、$G=\\begin{pmatrix}1&2\\end{pmatrix}$，则由 $G^{-1}F^{-1}$（单侧逆）得到的一个 {1}-逆是：","options":["$\\frac{1}{25}\\begin{pmatrix}1&2\\\\ 2&4\\end{pmatrix}$","$\\frac{1}{5}\\begin{pmatrix}1&2\\\\ 2&4\\end{pmatrix}$","$\\begin{pmatrix}1&2\\\\ 2&4\\end{pmatrix}$","$\\frac12\\begin{pmatrix}1&0\\\\ 0&1\\end{pmatrix}$"],"answer":0,"explain":"$F$ 的左逆 $F_L^{-1}=(F^{T}F)^{-1}F^{T}=\\frac15\\begin{pmatrix}1&2\\end{pmatrix}$，$G$ 的右逆 $G_R^{-1}=G^{T}(GG^{T})^{-1}=\\frac15\\begin{pmatrix}1\\\\ 2\\end{pmatrix}$，于是 $X=G_R^{-1}F_L^{-1}=\\frac{1}{25}\\begin{pmatrix}1&2\\\\ 2&4\\end{pmatrix}$，验算 $AXA=A$ ✓。其余选项都通不过 $AXA=A$ 的检验（已用 sympy 逐个复算）：因 $A^{2}=5A$、$A^{3}=25A$，故 $\\frac15A$ 代入得 $5A$、$A$ 本身代入得 $25A$、$\\frac12I$ 代入得 $\\frac52A$，都不等于 $A$。"},
  ],
  faq: [
    {"q":"{1}-逆和 $A^{+}$ 到底怎么区分？","a":"看满足几个 Penrose 方程。只满足 ①$AXA=A$ 的叫 {1}-逆，通常有无穷多个；四条全满足的才叫 Moore-Penrose 逆 $A^{+}$，唯一。考试最常见的陷阱是题目说「求广义逆」但没指明哪种——这时通常默认求 $A^{+}$（唯一的那个），因为弱广义逆不唯一、答案无法核对。"},
    {"q":"$A^{+}$ 和 $A^{-1}$ 什么关系？","a":"$A$ 可逆时 $A^{+}=A^{-1}$，广义逆是逆矩阵的真推广。验证：若 A 可逆，则 $(A^{H}A)^{-1}A^{H}=A^{-1}A^{-H}A^{H}=A^{-1}$。所以学广义逆不会和原来的逆矩阵冲突，只是把适用范围从「方阵且可逆」扩大到「任意矩阵」。"},
    {"q":"为什么 Σ⁺ 里零奇异值要取 0 而不是无穷？","a":"因为伪逆的设计目标是给出**最小范数最小二乘解**，而不是强行「求逆」。零奇异值对应的方向是 A 完全「压扁」的方向，信息已经丢失，无法恢复——取 0 等于承认这个方向没有信息，从而解在这些方向上取零，这正是「最小范数」的来源。如果取无穷大，解会爆炸，也就失去了意义。"}
  ]
}
];
