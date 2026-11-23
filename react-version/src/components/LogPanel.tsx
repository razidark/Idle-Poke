import React, { useEffect, useRef } from 'react';

interface LogPanelProps {
  logs: { id: string; text: string }[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full overflow-y-auto p-3 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {logs.length === 0 ? (
        <div className="text-center text-white/30 text-[10px] py-8">No activity yet.</div>
      ) : (
        logs.map(log => (
          <div
            key={log.id}
            className="text-[10px] text-white/75 font-medium leading-relaxed border-l-2 border-indigo-500/40 pl-2"
          >
            {log.text}
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
};
