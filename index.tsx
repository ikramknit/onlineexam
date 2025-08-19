import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import * as XLSX from 'xlsx';
import { createClient, Session } from '@supabase/supabase-js';

// --- Supabase Client Setup ---
// NOTE TO USER: Make sure you have created the user `ikram.knit@gmail.com`
// in your Supabase project's Authentication -> Users section.
const supabaseUrl = 'https://slxvagtskupvkosaamaw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNseHZhZ3Rza3Vwdmtvc2FhbWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODA4NTYsImV4cCI6MjA3MDE1Njg1Nn0.A720F6_WQJ4QREiux2L99jWLC_ZpYGfQLYREU7w0a4k';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Type Definitions ---
interface Question {
    id: number;
    question: string;
    options: string[];
    correct: number;
}

type QuestionInsert = Omit<Question, 'id'>;

const EXAM_DURATION = 3600; // 1 hour in seconds

// --- Component Prop Types ---
interface LoginViewProps {
    onLogin: (email: string, password: string) => Promise<any>;
    onStudentAccess: () => void;
}

interface AdminDashboardProps {
    questionCount: number;
    onGoToUpload: () => void;
    onManageQuestions: () => void;
    onLogout: () => Promise<void>;
}

interface UploadViewProps {
    onUploadComplete: () => void;
    onBack: () => void;
}

interface ManageQuestionsViewProps {
    questions: Question[];
    onDelete: (questionId: number) => Promise<void>;
    onBack: () => void;
}

interface ExamViewProps {
    questions: Question[];
    onFinish: (result: { score: number; questions: Question[]; answers: Record<number, number> }) => void;
    session: Session | null;
    onAdminBack?: () => void;
}

interface ResultViewProps {
    score: number;
    totalQuestions: number;
    onRetake: () => void;
    onGoHome: () => void;
    examData: {
        questions: Question[];
        answers: Record<number, number>;
    };
    session: Session | null;
}


// --- Login View Component ---
const LoginView = ({ onLogin, onStudentAccess }: LoginViewProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error } = await onLogin(email, password);
            if (error) {
                throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to log in. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Admin Login</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="ikram.knit@gmail.com"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p style={{color: 'red'}}>{error}</p>}
                    <button type="submit" className="btn" disabled={loading} style={{width: '100%'}}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <a href="#" onClick={(e) => { e.preventDefault(); onStudentAccess(); }} className="student-link">
                    Take Exam as a Student &rarr;
                </a>
            </div>
        </div>
    );
};


// --- Admin Dashboard Component (previously HomeView) ---
const AdminDashboard = ({ questionCount, onGoToUpload, onManageQuestions, onLogout }: AdminDashboardProps) => {
    return (
        <div className="upload-container">
            <div className="upload-card">
                 <button onClick={onLogout} className="btn btn-logout" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>Logout</button>
                <h2>Admin Dashboard</h2>
                {questionCount > 0 ? (
                    <p>There are <strong>{questionCount}</strong> questions in the database.</p>
                ) : (
                    <p>The question database is empty.</p>
                )}
                <div className="dashboard-actions">
                    <button onClick={onGoToUpload} className="btn">Add Questions</button>
                    <button onClick={onManageQuestions} className="btn btn-secondary" disabled={questionCount === 0}>
                        Manage Questions
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Upload View Component ---
const UploadView = ({ onUploadComplete, onBack }: UploadViewProps) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const result = event.target?.result;
                if (!result || !(result instanceof ArrayBuffer)) {
                    throw new Error('Failed to read the file data.');
                }
                const data = new Uint8Array(result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    throw new Error('The Excel file is empty or has an invalid format.');
                }

                const requiredHeaders = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];
                const actualHeaders = Object.keys(json[0]);
                const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));

                if (missingHeaders.length > 0) {
                    throw new Error(`Missing required columns in Excel file: ${missingHeaders.join(', ')}`);
                }

                const formattedQuestions: QuestionInsert[] = json.map((row, index) => {
                    const options = [row['Option A'], row['Option B'], row['Option C'], row['Option D']]
                        .filter(opt => opt !== undefined && opt !== null)
                        .map(opt => String(opt));
                    
                    const correctLetter = row['Correct Answer']?.toString().toUpperCase().trim();
                    const correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetter);

                    if (!row['Question'] || options.length < 2 || correctIndex === -1) {
                        throw new Error(`Invalid data in row ${index + 2}. Please check question, options, and correct answer.`);
                    }

                    return {
                        question: String(row['Question']),
                        options,
                        correct: correctIndex,
                    };
                });
                
                const { error: insertError } = await supabase.from('questions').insert(formattedQuestions);
                if (insertError) {
                    throw new Error(`Supabase error: ${insertError.message}`);
                }

                onUploadComplete();
            } catch (err: any) {
                console.error("Error parsing and uploading file:", err);
                setError(err.message || 'Failed to parse and upload the file.');
                setLoading(false);
            }
        };
        reader.onerror = () => {
             setError('Failed to read the file.');
             setLoading(false);
        }
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="upload-container">
            <div className="upload-card">
                <button onClick={onBack} className="back-button" aria-label="Go back">&larr;</button>
                <h2>Upload Questions</h2>
                <p>Upload an Excel file with your questions to add them to the exam database.</p>
                <label htmlFor="file-upload" className={`file-input-label ${loading ? 'disabled' : ''}`}>
                    {loading ? 'Processing...' : 'Select Excel File'}
                </label>
                <input id="file-upload" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={loading} />
                {error && <p style={{color: 'red', marginTop: '1rem'}}>{error}</p>}
                <div className="excel-format-hint">
                    <h4>Required Excel Format:</h4>
                    <p>Your file must contain the following columns:</p>
                    <ul>
                        <li><code>Question</code></li>
                        <li><code>Option A</code></li>
                        <li><code>Option B</code></li>
                        <li><code>Option C</code></li>
                        <li><code>Option D</code></li>
                        <li><code>Correct Answer</code> (use letters A, B, C, or D)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// --- Manage Questions View Component ---
const ManageQuestionsView = ({ questions, onDelete, onBack }: ManageQuestionsViewProps) => {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState('');

    const handleDelete = async (questionId: number) => {
        if (!window.confirm('Are you sure you want to delete this question?')) {
            return;
        }
        setDeletingId(questionId);
        setError('');
        try {
            await onDelete(questionId);
        } catch (err: any) {
            setError(err.message || 'Failed to delete question.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <button onClick={onBack} className="back-button" aria-label="Go back">&larr;</button>
                <div className="app-header-title">Manage Questions</div>
            </header>
            <div className="manage-container">
                {error && <p style={{color: 'red'}}>{error}</p>}
                {questions.length > 0 ? (
                    <ul className="question-list">
                        {questions.map((q) => (
                            <li key={q.id} className="question-list-item">
                                <p>{q.question}</p>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(q.id)}
                                    disabled={deletingId === q.id}
                                >
                                    {deletingId === q.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No questions to manage.</p>
                )}
            </div>
        </div>
    );
};


// --- Exam View Component ---
const ExamView = ({ questions, onFinish, session, onAdminBack }: ExamViewProps) => {
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
    
    const examQuestions = useMemo(() => {
        if (!questions || questions.length === 0) return [];
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(50, shuffled.length));
    }, [questions]);

    const finishExam = useCallback(() => {
        let finalScore = 0;
        examQuestions.forEach((q) => {
            if (userAnswers[q.id] === q.correct) {
                finalScore += 2;
            }
        });
        onFinish({ score: finalScore, questions: examQuestions, answers: userAnswers });
    }, [examQuestions, userAnswers, onFinish]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    finishExam();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [finishExam]);

    const handleAnswerChange = (questionId: number, answerIndex: number) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    };

    const handleNext = () => {
        setCurrentQuestionIndex(prev => Math.min(prev + 1, examQuestions.length - 1));
    };

    const handlePrev = () => {
        setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
    };

    const handlePaletteClick = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (examQuestions.length === 0) {
        return <div className="loading-container">Preparing exam...</div>;
    }

    const currentQuestion = examQuestions[currentQuestionIndex];

    return (
        <div className="app-container">
            <header className="app-header">
                {session && <button onClick={onAdminBack} className="back-button" aria-label="Go back">&larr;</button>}
                <div className="app-header-title">ITI Health Sanitary Inspector CBT Exam</div>
            </header>
            <main className="exam-view">
                <div className="question-area">
                    <div className="question-card">
                        <p className="question-text">{currentQuestionIndex + 1}. {currentQuestion.question}</p>
                        <ul className="options-list">
                            {currentQuestion.options.map((option, index) => (
                                <li key={index} className="option-item">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion.id}`}
                                            checked={userAnswers[currentQuestion.id] === index}
                                            onChange={() => handleAnswerChange(currentQuestion.id, index)}
                                        />
                                        <span>{option}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="navigation-buttons">
                        <button className="btn" onClick={handlePrev} disabled={currentQuestionIndex === 0}>Previous</button>
                        <button className="btn btn-finish" onClick={finishExam}>Finish Exam</button>
                        <button className="btn" onClick={handleNext} disabled={currentQuestionIndex === examQuestions.length - 1}>Next</button>
                    </div>
                </div>
                <aside className="sidebar-area">
                    <div className="sidebar-card">
                        <div className="timer">{formatTime(timeLeft)}</div>
                    </div>
                    <div className="sidebar-card question-palette">
                        <h4>Question Palette</h4>
                         <div className="palette-legend">
                            <div className="legend-item"><span className="legend-color" style={{backgroundColor: 'var(--correct-color)'}}></span> Answered</div>
                            <div className="legend-item"><span className="legend-color" style={{backgroundColor: '#f8f9fa', border: '1px solid #ccc'}}></span> Unanswered</div>
                            <div className="legend-item"><span className="legend-color" style={{backgroundColor: 'var(--current-question-color)'}}></span> Current</div>
                        </div>
                        <div className="palette-grid">
                            {examQuestions.map((q, index) => {
                                const isAnswered = userAnswers[q.id] !== undefined;
                                const isCurrent = index === currentQuestionIndex;
                                let className = 'palette-item';
                                if (isCurrent) {
                                    className += ' current';
                                } else if (isAnswered) {
                                    className += ' answered';
                                } else {
                                    className += ' not-answered';
                                }
                                return (
                                    <button key={q.id} className={className} onClick={() => handlePaletteClick(index)}>
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

// --- Result View Component ---
const ResultView = ({ score, totalQuestions, onRetake, onGoHome, examData, session }: ResultViewProps) => {
    const { questions: examQuestions, answers: userAnswers } = examData;

    return (
        <div className="app-container">
            <header className="app-header">Exam Result</header>
            <div className="result-content">
                <div className="result-summary">
                    <h2>Exam Finished!</h2>
                    <p>Your Score:</p>
                    <p className="score">{score} / {totalQuestions * 2}</p>
                    <p>Total Questions: <span className="correct">{totalQuestions}</span></p>
                    <p>Correct Answers: <span className="correct">{score / 2}</span></p>
                    <p>Incorrect/Unanswered: <span className="incorrect">{totalQuestions - (score / 2)}</span></p>
                    <div style={{marginTop: '2rem'}}>
                        <button onClick={onRetake} className="btn btn-retake">Retake Exam</button>
                        <button onClick={onGoHome} className="btn">
                          {session ? 'Back to Dashboard' : 'Back to Home'}
                        </button>
                    </div>
                </div>
                
                <div className="result-details">
                    <h3>Question Review</h3>
                    {examQuestions.map((q, index) => (
                        <div key={q.id} className="result-question-card">
                            <p className="question-text">{index + 1}. {q.question}</p>
                            <ul className="options-list">
                                {q.options.map((option, optIndex) => {
                                    const isCorrect = optIndex === q.correct;
                                    const isUserChoice = userAnswers[q.id] === optIndex;
                                    let className = 'result-option';
                                    if (isCorrect) {
                                        className += ' correct';
                                    } else if (isUserChoice) {
                                        className += ' incorrect';
                                    }
                                    return (
                                        <li key={optIndex} className={className}>
                                            <span>{option}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

// --- Main App Component ---
const App = () => {
    const [appState, setAppState] = useState('loading');
    const [session, setSession] = useState<Session | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [finalScore, setFinalScore] = useState(0);
    const [lastExamData, setLastExamData] = useState<{ questions: Question[]; answers: Record<number, number> }>({ questions: [], answers: {} });
    const [dataLoaded, setDataLoaded] = useState(false);

    // Check session on initial load and subscribe to auth changes
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setAppState(session ? 'adminDashboard' : 'login');
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (_event === 'SIGNED_OUT') {
                setAppState('login');
            } else if (_event === 'SIGNED_IN') {
                 setAppState('adminDashboard');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchQuestions = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('questions').select('*');
            if (error) throw error;
            setQuestions(data || []);
        } catch (error) {
            console.error("Error fetching questions:", error);
            setQuestions([]);
        } finally {
            setDataLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!dataLoaded) {
            fetchQuestions();
        }
    }, [dataLoaded, fetchQuestions]);

    const handleLogin = async (email, password) => {
        return await supabase.auth.signInWithPassword({ email, password });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleDeleteQuestion = async (questionId: number) => {
        const { error } = await supabase.from('questions').delete().eq('id', questionId);
        if (error) {
            throw new Error(error.message);
        }
        // Refetch questions after deletion
        setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
    };

    const handleUploadComplete = () => {
        fetchQuestions(); // Refetch questions to include new ones
        setAppState('adminDashboard'); // Go back to dashboard after upload
    };

    const handleFinishExam = ({ score, questions, answers }: { score: number, questions: Question[], answers: Record<number, number> }) => {
        setFinalScore(score);
        setLastExamData({ questions, answers });
        setAppState('result');
    };
    
    const handleRetake = () => {
        setFinalScore(0);
        setLastExamData({ questions: [], answers: {} });
        setAppState('exam');
    };
    
    const handleGoHome = () => {
        setAppState(session ? 'adminDashboard' : 'login');
    };
    
    // --- Render Logic ---
    
    if (appState === 'loading' || !dataLoaded) {
        return <div className="loading-container">Loading...</div>;
    }

    if (!session) { // Public routes for students
        if (appState === 'exam') {
            return <ExamView questions={questions} onFinish={handleFinishExam} session={null} />;
        }
        if (appState === 'result') {
            const totalQuestions = lastExamData.questions.length;
            return <ResultView score={finalScore} totalQuestions={totalQuestions} onRetake={handleRetake} onGoHome={handleGoHome} examData={lastExamData} session={null} />;
        }
        return <LoginView onLogin={handleLogin} onStudentAccess={() => setAppState('exam')} />;
    }
    
    // Protected routes for admins
    if (session) {
        if (appState === 'adminDashboard') {
            return <AdminDashboard 
                questionCount={questions.length} 
                onGoToUpload={() => setAppState('upload')}
                onManageQuestions={() => setAppState('manageQuestions')}
                onLogout={handleLogout}
            />;
        }
        if (appState === 'upload') {
            return <UploadView onUploadComplete={handleUploadComplete} onBack={() => setAppState('adminDashboard')} />;
        }
        if (appState === 'manageQuestions') {
            return <ManageQuestionsView questions={questions} onDelete={handleDeleteQuestion} onBack={() => setAppState('adminDashboard')} />;
        }
        if (appState === 'exam') {
             return <ExamView questions={questions} onFinish={handleFinishExam} session={session} onAdminBack={() => setAppState('adminDashboard')}/>;
        }
        if (appState === 'result') {
             const totalQuestions = lastExamData.questions.length;
             return <ResultView score={finalScore} totalQuestions={totalQuestions} onRetake={handleRetake} onGoHome={handleGoHome} examData={lastExamData} session={session} />;
        }
    }
    
    return <LoginView onLogin={handleLogin} onStudentAccess={() => setAppState('exam')} />;
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
