
import React, { useState } from 'react';
import { Layout } from './components/Layout.tsx';
import { Welcome } from './components/Welcome.tsx';
import { Login, LoginDestination } from './components/Login.tsx';
import { Intro } from './components/Intro.tsx';
import { Quiz } from './components/Quiz.tsx';
import { MemoryGame } from './components/MemoryGame.tsx';
import { ShooterGame } from './components/ShooterGame.tsx';
import { LevelUp } from './components/LevelUp.tsx';
import { Gacha } from './components/Gacha.tsx';
import { KeepMemories } from './components/KeepMemories.tsx';
import { Scene } from './types.ts';

function App() {
  const [scene, setScene] = useState<Scene>(Scene.WELCOME);
  const [isTestMode, setIsTestMode] = useState(false);

  const handleLoginSuccess = (destination: LoginDestination) => {
    switch (destination) {
      case 'GACHA':
        setScene(Scene.GACHA);
        break;
      case 'MEMORIES':
        setIsTestMode(false);
        setScene(Scene.KEEP_MEMORIES);
        break;
      case 'MEMORIES_TEST':
        setIsTestMode(true);
        setScene(Scene.KEEP_MEMORIES);
        break;
      case 'INTRO':
      default:
        setScene(Scene.INTRO);
        break;
    }
  };

  const handleReset = () => {
    setScene(Scene.WELCOME);
    setIsTestMode(false);
  };

  // Simple state machine for scene transitions
  const renderScene = () => {
    switch (scene) {
      case Scene.WELCOME:
        return <Welcome onStart={() => setScene(Scene.LOGIN)} />;
      case Scene.LOGIN:
        return <Login onSuccess={handleLoginSuccess} />;
      case Scene.INTRO:
        return <Intro onNext={() => setScene(Scene.QUIZ)} />;
      case Scene.QUIZ:
        return <Quiz onComplete={() => setScene(Scene.MEMORY_GAME)} />;
      case Scene.MEMORY_GAME:
        return <MemoryGame onComplete={() => setScene(Scene.SHOOTER_GAME)} />;
      case Scene.SHOOTER_GAME:
        return <ShooterGame onComplete={() => setScene(Scene.LEVEL_UP)} />;
      case Scene.LEVEL_UP:
        return <LevelUp onComplete={() => setScene(Scene.GACHA)} />;
      case Scene.GACHA:
        return <Gacha onReset={handleReset} onKeepMemories={() => setScene(Scene.KEEP_MEMORIES)} />;
      case Scene.KEEP_MEMORIES:
        return <KeepMemories onRestart={handleReset} testMode={isTestMode} />;
      default:
        return <Welcome onStart={() => setScene(Scene.LOGIN)} />;
    }
  };

  return (
    <Layout>
      {renderScene()}
    </Layout>
  );
}

export default App;
