import "./App.css";
import DrawingScreen from "./components/DrawingScreen";

export default function App() {
  return (
    <main className="starting-page">
      <h1>ScribblePark</h1>
      <p>Shared project foundation is running.</p>
      <DrawingScreen></DrawingScreen>
    </main>
  );
}