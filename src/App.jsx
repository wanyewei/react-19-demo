import { useState } from "react";
import Sidebar from "./components/Sidebar";
import DemoActions from "./demos/DemoActions";
import DemoUseOptimistic from "./demos/DemoUseOptimistic";
import DemoUseApi from "./demos/DemoUseApi";
import DemoRefAsProp from "./demos/DemoRefAsProp";
import DemoContextAndMore from "./demos/DemoContextAndMore";
import DemoTransition from "./demos/DemoTransition";
import DemoCompiler from "./demos/DemoCompiler";

const demos = [
  { id: "transition", label: "startTransition 非阻塞", component: DemoTransition },
  { id: "actions", label: "Actions & useActionState", component: DemoActions },
  { id: "optimistic", label: "useOptimistic", component: DemoUseOptimistic },
  { id: "use", label: "use() API", component: DemoUseApi },
  { id: "ref", label: "ref as prop", component: DemoRefAsProp },
  { id: "context", label: "Context & 其他改進", component: DemoContextAndMore },
  { id: "compiler", label: "React Compiler", component: DemoCompiler },
];

export default function App() {
  const [activeDemo, setActiveDemo] = useState("transition");
  const current = demos.find((d) => d.id === activeDemo);
  const ActiveComponent = current.component;

  return (
    <>
      <Sidebar
        demos={demos}
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
