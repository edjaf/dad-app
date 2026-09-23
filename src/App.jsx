import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Clock, Plus, Circle } from 'lucide-react';
import { db, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc } from './firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function App() {
  const [chatInput, setChatInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Ledger synchronized. I am evaluating your throughput. Report your status." }
  ]);
  const uid = 'test-user-123'; 

  // Firebase Telemetry
  useEffect(() => {
    const operationsRef = collection(db, 'users', uid, 'operations');
    const q = query(operationsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(liveData);
    });
    return () => unsubscribe(); 
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await addDoc(collection(db, 'users', uid, 'operations'), {
        title: newTaskTitle,
        operation_type: 'task',
        category: 'General',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setNewTaskTitle('');
    } catch (error) {
      console.error("Dispatch failed:", error);
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      await updateDoc(doc(db, 'users', uid, 'operations', taskId), {
        status: newStatus
      });
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  // AI Mentor Engine
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

      const taskContext = tasks.map(t => `- ${t.title} [${t.status.toUpperCase()}]`).join('\n');
      
      const prompt = `
      You are Dad Aurelius, an uncompromising, highly analytical Stoic mentor. 
      You combine the discipline of Marcus Aurelius and the clinical accountability of Jordan Peterson.
      You do not coddle. You ruthlessly dissect logistical failures and demand execution. 
      Keep responses concise (2-4 sentences max). Use a calm, firm, intellectual tone.
      
      Current User Task Ledger:
      ${taskContext || "The ledger is entirely empty. Unacceptable."}

      User reports: ${userText}
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      console.error("AI connection failed:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Communication failure. Check the browser console." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const mosaicTiles = Array.from({ length: 28 }, (_, i) => i < 18); 

  return (
    <div className="flex flex-col lg:flex-row bg-alabaster text-charcoal font-lato overflow-hidden">
      
      {/* LEFT WING: The Open Courtyard */}
      <div className="w-2/3 flex flex-col p-10 overflow-y-auto custom-scrollbar">
        <header className="mb-10 pb-6 border-b border-plaster animate-in">
          <h1 className="text-4xl font-marcellus text-fresco tracking-wide transition-colors duration-500">
            Dad <span className="text-terracotta">Aurelius</span>
          </h1>
          <p className="text-xs text-charcoal/60 uppercase tracking-widest mt-2 font-bold">Status: AI Core Online</p>
        </header>

        {/* Throughput Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 animate-in delay-100">
          <div className="bg-white p-6 rounded-2xl border border-plaster transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_-4px_rgba(59,91,120,0.1)]">
            <h3 className="text-charcoal/50 text-xs uppercase mb-2 font-bold tracking-wider">1% Better</h3>
            <div className="flex flex-wrap gap-1 mt-3">
              {mosaicTiles.map((isComplete, idx) => (
                <div key={idx} className={`w-3 h-3 rounded-sm transition-colors duration-700 ${isComplete ? 'bg-fresco hover:bg-fresco/80' : 'bg-plaster'}`}></div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-plaster transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_-4px_rgba(59,91,120,0.1)] flex flex-col justify-center">
            <h3 className="text-charcoal/50 text-xs uppercase mb-1 font-bold tracking-wider">Goal Alignment</h3>
            <p className="text-2xl font-marcellus text-olive">On Track</p>
          </div>
        </div>

        {/* Task Entry Terminal */}
        <form onSubmit={handleAddTask} className="mb-8 flex gap-3 animate-in delay-200">
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Log new operation into the ledger..." 
            className="flex-1 bg-white border border-plaster rounded-xl text-charcoal px-5 py-4 focus:outline-none focus:border-fresco/40 focus:ring-4 focus:ring-fresco/10 transition-all duration-300 shadow-sm hover:shadow-md"
          />
          <button type="submit" className="bg-fresco text-white px-8 rounded-xl hover:bg-fresco/90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center font-bold tracking-wide shadow-sm hover:shadow-lg">
            <Plus className="w-4 h-4 mr-2"/> Add
          </button>
        </form>

        {/* The Clean Desk */}
        <div className="mb-10 animate-in delay-300">
          <h2 className="text-xl font-marcellus text-charcoal mb-5 flex items-center"><Clock className="w-5 h-5 mr-3 text-fresco"/> Active Pipeline</h2>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-charcoal/50 text-sm italic p-6 text-center bg-white rounded-2xl border border-plaster">Ledger is empty. Action is required.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="group flex items-center justify-between bg-white p-5 rounded-xl border border-plaster transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center">
                    {task.status === 'completed' ? (
                      <CheckCircle 
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="w-5 h-5 text-olive mr-4 scale-110 transition-transform duration-300 cursor-pointer" 
                      />
                    ) : (
                      <Circle 
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="w-5 h-5 text-charcoal/20 mr-4 cursor-pointer hover:text-fresco hover:scale-110 transition-all duration-300" 
                      />
                    )}
                    <div>
                      <p className={`text-base transition-all duration-500 ${task.status === 'completed' ? 'text-charcoal/40 line-through' : 'text-charcoal font-medium'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-charcoal/50 mt-1 uppercase tracking-wider">{task.category}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT WING: Mentor Terminal */}
      <div className="w-1/3 flex flex-col bg-white border-l border-plaster shadow-[-10px_0_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
        <div className="p-8 border-b border-plaster bg-alabaster/80 backdrop-blur-md">
          <h2 className="text-sm font-bold text-charcoal/50 uppercase tracking-widest flex items-center">
            <span className="w-2 h-2 rounded-full bg-olive mr-2 animate-pulse"></span>
            Mentor Terminal
          </h2>
        </div>
        
        {/* Dynamic Chat Feed */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col animate-in ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className={`text-xs uppercase tracking-widest mb-1 font-bold ${msg.role === 'user' ? 'text-charcoal/50' : 'text-fresco'}`}>
                {msg.role === 'user' ? 'You' : 'Dad Aurelius'}
              </span>
              <div className={`text-base leading-loose p-6 rounded-2xl shadow-sm border max-w-[90%] ${
                msg.role === 'user' 
                  ? 'bg-fresco text-white border-fresco rounded-tr-sm' 
                  : 'bg-alabaster text-charcoal border-plaster rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex flex-col items-start animate-in">
              <span className="text-xs text-fresco uppercase tracking-widest mb-1 font-bold">Dad Aurelius</span>
              <div className="text-base text-charcoal bg-alabaster p-6 rounded-2xl rounded-tl-sm border border-plaster shadow-sm">
                Analyzing ledger...
              </div>
            </div>
          )}
        </div>

        {/* Input Matrix */}
        <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-plaster">
          <div className="relative group">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Report to your mentor..." 
              className="w-full bg-alabaster border border-plaster rounded-xl text-charcoal px-5 py-4 pr-12 focus:outline-none focus:border-fresco/40 focus:ring-4 focus:ring-fresco/10 transition-all duration-300"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 hover:text-fresco p-2 transition-all duration-300 hover:scale-110 active:scale-95">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}