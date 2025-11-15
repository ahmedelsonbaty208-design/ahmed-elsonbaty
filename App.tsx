import React, { useState, useCallback } from 'react';
import { Platform, Tone } from './types';
import { generateContent } from './services/geminiService';

// --- Icon Components ---
const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 01.867.5 1 1 0 01-1.732 1L10 3zM10 17a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1zM5.293 6.707a1 1 0 010-1.414l2-2a1 1 0 011.414 1.414l-2 2a1 1 0 01-1.414 0zM12.293 13.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414zM3 10a1 1 0 011-1h2a1 1 0 110 2H4a1 1 0 01-1-1zM13 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM6.707 14.707a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414l2 2a1 1 0 010 1.414zM13.293 5.293a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414l2-2a1 1 0 011.414 0z" clipRule="evenodd" />
    <path d="M10 5.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM10 12a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const LoadingIndicator: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-6 text-center text-slate-400">
        <svg className="w-16 h-16 text-sky-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-200">جاري إنشاء المحتوى...</h3>
            <p className="text-slate-400">يقوم الذكاء الاصطناعي الآن بصياغة أفكار إبداعية لك. قد يستغرق هذا بضع لحظات.</p>
        </div>
    </div>
);


// --- UI Components ---

interface ContentOutputProps {
    content: string;
    isLoading: boolean;
    error: string | null;
}

const ContentOutput: React.FC<ContentOutputProps> = ({ content, isLoading, error }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        if (!content) return;

        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error("Failed to copy content: ", err);
            alert("فشل نسخ المحتوى. قد لا يدعم متصفحك هذه الميزة أو قد تحتاج إلى منح الإذن.");
        });
    }, [content]);
    
    if (isLoading) {
        return <LoadingIndicator />;
    }
    
    if (error) {
        return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
    }

    if (!content) {
        return (
            <div className="text-center text-slate-400">
                <h3 className="text-xl font-bold mb-2">مرحباً بك في كتابة محتوى احترافى</h3>
                <p>املأ الحقول على اليمين لإنشاء محتوى مخصص للسوق المصري.</p>
            </div>
        );
    }

    return (
        <div className="relative bg-slate-900/50 p-6 rounded-lg w-full">
            <button
                onClick={handleCopy}
                aria-label="نسخ المحتوى إلى الحافظة"
                disabled={copied}
                className="absolute top-3 left-3 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {copied ? 'تم النسخ!' : 'نسخ المحتوى'}
                <CopyIcon />
            </button>
            <pre className="whitespace-pre-wrap text-slate-200 text-lg leading-relaxed scrollbar-thin overflow-auto max-h-[70vh]">{content}</pre>
        </div>
    );
};


// --- Main App Component ---

const App: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [platforms, setPlatforms] = useState<Platform[]>([Platform.BLOG]);
    const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
    const [audience, setAudience] = useState('العملاء المحتملين في مصر');
    const [cta, setCta] = useState('');
    
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePlatformChange = (platform: Platform) => {
      setPlatforms(prev =>
        prev.includes(platform)
          ? prev.filter(p => p !== platform)
          : [...prev, platform]
      );
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        try {
            const content = await generateContent(topic, platforms, tone, audience, cta);
            setGeneratedContent(content);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [topic, platforms, tone, audience, cta]);
    
    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <main className="container mx-auto px-4 py-8">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500">
                        كتابة محتوى احترافى
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        أنشئ محتوى احترافي لمصر بنقرة زر
                    </p>
                </header>
                
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3 lg:sticky lg:top-8 self-start">
                        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 space-y-6">
                            <div>
                                <label htmlFor="topic" className="block text-lg font-medium text-slate-300 mb-2">الموضوع الرئيسي</label>
                                <textarea
                                    id="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="مثال: أفضل استراتيجيات التسويق الرقمي للشركات الصغيرة"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 h-28"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-lg font-medium text-slate-300 mb-2">المنصات</label>
                                <div className="grid grid-cols-2 gap-3">
                                  {Object.values(Platform).map(p => (
                                    <label key={p} className={`flex items-center space-x-3 rounded-md p-3 cursor-pointer transition-colors border ${platforms.includes(p) ? 'bg-sky-900/50 border-sky-500' : 'bg-slate-900 border-slate-600 hover:bg-slate-700'}`}>
                                      <input
                                        type="checkbox"
                                        checked={platforms.includes(p)}
                                        onChange={() => handlePlatformChange(p)}
                                        className="form-checkbox h-5 w-5 bg-slate-800 border-slate-500 text-sky-500 focus:ring-sky-500 rounded"
                                      />
                                      <span className="text-slate-300">{p}</span>
                                    </label>
                                  ))}
                                </div>
                            </div>
                            
                             <div>
                                <label htmlFor="tone" className="block text-lg font-medium text-slate-300 mb-2">نبرة المحتوى</label>
                                <select
                                  id="tone"
                                  value={tone}
                                  onChange={(e) => setTone(e.target.value as Tone)}
                                  className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
                                >
                                  {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                             <div>
                                <label htmlFor="audience" className="block text-lg font-medium text-slate-300 mb-2">الجمهور المستهدف</label>
                                <input
                                    type="text"
                                    id="audience"
                                    value={audience}
                                    onChange={(e) => setAudience(e.target.value)}
                                    placeholder="مثال: الشباب المهتم بالتكنولوجيا"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="cta" className="block text-lg font-medium text-slate-300 mb-2">دعوة للعمل (CTA) - اختياري</label>
                                <textarea
                                    id="cta"
                                    value={cta}
                                    onChange={(e) => setCta(e.target.value)}
                                    placeholder="مثال: تواصل معنا الآن لمعرفة المزيد!"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 h-20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !topic.trim() || platforms.length === 0}
                                className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/50"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        جاري الإنشاء...
                                    </>
                                ) : (
                                    <>
                                        <SparkleIcon />
                                        إنشاء المحتوى
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="lg:w-2/3 min-h-[60vh] flex items-center justify-center p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                      <ContentOutput content={generatedContent} isLoading={isLoading} error={error} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;