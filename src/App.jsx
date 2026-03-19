import { useState } from "react";
import Sidebar from "./components/Sidebar";
import DemoOverview from "./demos/DemoOverview";
import DemoTransition from "./demos/DemoTransition";
import DemoActions from "./demos/DemoActions";
import DemoUseOptimistic from "./demos/DemoUseOptimistic";
import DemoUseApi from "./demos/DemoUseApi";
import DemoRefAsProp from "./demos/DemoRefAsProp";
import DemoContextAndMore from "./demos/DemoContextAndMore";
import DemoErrorHandling from "./demos/DemoErrorHandling";
import DemoCompiler from "./demos/DemoCompiler";
import DemoServer from "./demos/DemoServer";
import DemoMigration from "./demos/DemoMigration";

const groups = [
  {
    label: "概覽",
    icon: "📋",
    items: [
      { id: "overview", label: "React 19 總覽", component: DemoOverview },
    ],
  },
  {
    label: "新 Hooks & API",
    icon: "⚡",
    items: [
      { id: "transition", label: "startTransition & Actions", component: DemoTransition },
      { id: "actions", label: "useActionState 進階", component: DemoActions },
      { id: "optimistic", label: "useOptimistic", component: DemoUseOptimistic },
      { id: "use", label: "use() API", component: DemoUseApi },
    ],
  },
  {
    label: "DX 改善",
    icon: "🛠",
    items: [
      { id: "ref", label: "ref as prop", component: DemoRefAsProp },
      { id: "context", label: "Context & 其他改進", component: DemoContextAndMore },
      { id: "error", label: "Error Handling 改進", component: DemoErrorHandling },
    ],
  },
  {
    label: "效能 & 編譯",
    icon: "🚀",
    items: [
      { id: "compiler", label: "React Compiler", component: DemoCompiler },
    ],
  },
  {
    label: "Server 特性",
    icon: "🌐",
    items: [
      { id: "server", label: "Server Components & Actions", component: DemoServer },
    ],
  },
  {
    label: "結論",
    icon: "📌",
    items: [
      { id: "migration", label: "總結 & 重點回顧", component: DemoMigration },
    ],
  },
];

const allDemos = groups.flatMap((g) => g.items);

export default function App() {
  const [activeDemo, setActiveDemo] = useState("overview");
  const current = allDemos.find((d) => d.id === activeDemo);
  const ActiveComponent = current.component;

  return (
    <>
      <Sidebar
        groups={groups}
        activeDemo={activeDemo}
        onSelect={setActiveDemo}
      />
      <main style={styles.main}>
        <ActiveComponent />
      </main>
    </>
  );
}

const styles = {
  main: {
    flex: 1,
    padding: "40px 48px",
    overflowY: "auto",
    maxHeight: "100vh",
  },
};
