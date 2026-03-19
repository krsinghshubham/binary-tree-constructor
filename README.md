# DS Visualizer

Interactive **data structure** playground: start with **binary trees** and **graphs**, with room to add more structures later.

Build and visualize structures, copy formats that work with **LeetCode-style** inputs, and tweak themes (dark / light / LeetCode).

**Try it:** [https://binary-tree-constructor.vercel.app/](https://binary-tree-constructor.vercel.app/)  
*(Vercel project may still use the old name until you reconnect or rename the deployment.)*

---

**Repo / package name:** `ds-visualizer`. If your folder is still `binary-tree-constructor`, rename it locally with `mv binary-tree-constructor ds-visualizer` (optional). On **GitHub**: *Settings → General → Repository name* → `ds-visualizer`, then update remotes and any CI/deploy URLs.

---

**Note:** Side project, built iteratively. improvements welcome.

---

## What it does

### Binary tree

- Paste or type a **BFS array** (e.g. `[1,2,3,null,4,5]`) and see the tree.
- **Drag** nodes from the bottom chip onto the canvas; drop left/right of a parent.
- **Drag** existing nodes to reparent (with subtree).
- **Traversals:** inorder, preorder, postorder with step highlight.
- **Validation:** BST, balanced, height.
- **Undo/redo**, **delete** node, **copy** array / JSON.
- **Sample trees**, **zoom/pan** on the canvas.

### Graph

- Switch to **Graph** in the header: **LeetCode JSON** (`[[u,v]]`, `[[u,v,w]]`, or `{"n","edges"}`) or **text** edge lists (`a-b`, `a-b:weight`).
- **Add node**, **Connect** / **Select** modes, optional edge weights, **remove** nodes.

---

No sign-up — run locally with `npm install` and `npm run dev`, or deploy static `dist/` (see [DEPLOY.md](DEPLOY.md)).
