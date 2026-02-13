import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Welcome } from './components/Welcome';
import { Login, LoginDestination } from './components/Login';
import { Intro } from './components/Intro';
import { Quiz } from './components/Quiz';
import { MemoryGame } from './components/MemoryGame';
import { ShooterGame } from './components/ShooterGame';
import { LevelUp } from './components/LevelUp';
import { Gacha } from './components/Gacha';
import { KeepMemories } from './components/KeepMemories';
import { Scene } from './types';

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