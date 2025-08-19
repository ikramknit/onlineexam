import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import * as XLSX from 'xlsx';

const EXAM_DURATION = 3600; // 1 hour in seconds

// --- Upload View Component ---
const UploadView = ({ onUploadSuccess }) => {
    const [error, setError] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result;
                if (!result || !(result instanceof ArrayBuffer)) {
                    setError('Failed to read the file data.');
                    return;
                }
                const data = new Uint8Array(result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    setError('The Excel file is empty or has an invalid format.');
                    return;
                }

                const requiredHeaders = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];
                const actualHeaders = Object.keys(json[0]);
                const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));

                if (missingHeaders.length > 0) {
                     setError(`Missing required columns in Excel file: ${missingHeaders.join(', ')}`);
                     return;
                }

                const formattedQuestions = json.map((row, index) => {
                    const options = [row['Option A'], row['Option B'], row['Option C'], row['Option D']].filter(opt => opt !== undefined && opt !== null);
                    const correctLetter = row['Correct Answer']?.toString().toUpperCase().trim();
                    const correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetter);

                    if (!row['Question'] || options.length < 2 || correctIndex === -1) {
                        throw new Error(`Invalid data in row ${index + 2}. Please check question, options, and correct answer.`);
                    }

                    return {
                        id: index + 1,
                        question: row['Question'],
                        options,
                        correct: correctIndex,
                    };
                });
                onUploadSuccess(formattedQuestions);
            } catch (err) {
                console.error("Error parsing file:", err);
                setError(err.message || 'Failed to parse the Excel file. Please ensure it has the correct format and data.');
            }
        };
        reader.onerror = () => {
             setError('Failed to read the file.');
        }
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="upload-container">
            <div className="upload-card">
                <h2>CBT Exam Simulator</h2>
                <p>Upload an Excel file with your questions to begin the exam.</p>
                <label htmlFor="file-upload" className="file-input-label">
                    Select Excel File
                </label>
                <input id="file-upload" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
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


// --- Exam View Component ---
const ExamView = ({ questions, onFinish }) => {
    const [userAnswers, setUserAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
    
    const examQuestions = useMemo(() => {
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
        onFinish(finalScore);
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

    const handleAnswerChange = (questionId, answerIndex) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    };

    const handleNext = () => {
        setCurrentQuestionIndex(prev => Math.min(prev + 1, examQuestions.length - 1));
    };

    const handlePrev = () => {
        setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
    };

    const handlePaletteClick = (index) => {
        setCurrentQuestionIndex(index);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (examQuestions.length === 0) {
        return <div>Loading questions...</div>;
    }

    const currentQuestion = examQuestions[currentQuestionIndex];

    return (
        <div className="app-container">
            <header className="app-header">ITI Health Sanitary Inspector CBT Exam</header>
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
const ResultView = ({ score, totalQuestions, onRetake, onLoadNew }) => {
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
                        <button onClick={onLoadNew} className="btn">Load New Exam</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
const App = () => {
    const [appState, setAppState] = useState('upload'); // 'upload', 'exam', 'result'
    const [questions, setQuestions] = useState([]);
    const [finalScore, setFinalScore] = useState(0);

    const handleUploadSuccess = (uploadedQuestions) => {
        setQuestions(uploadedQuestions);
        setAppState('exam');
    };

    const handleFinishExam = (score) => {
        setFinalScore(score);
        setAppState('result');
    };
    
    const handleRetake = () => {
        // Reset score and go back to exam. Questions are already loaded.
        setFinalScore(0);
        setAppState('exam');
    };

    const handleLoadNew = () => {
        // Reset everything and go back to upload screen
        setQuestions([]);
        setFinalScore(0);
        setAppState('upload');
    };

    if (appState === 'upload') {
        return <UploadView onUploadSuccess={handleUploadSuccess} />;
    }

    if (appState === 'exam') {
        return <ExamView questions={questions} onFinish={handleFinishExam} />;
    }

    if (appState === 'result') {
        const totalQuestions = Math.min(50, questions.length);
        return <ResultView score={finalScore} totalQuestions={totalQuestions} onRetake={handleRetake} onLoadNew={handleLoadNew} />;
    }

    return <div>Loading App...</div>;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
