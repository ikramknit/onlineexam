import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// --- DATA ---
const allQuestions = [
    { id: 1, question: "Minimum illumination required for Operation Theatre (OT) and Labour room should be:", options: ["100 lux", "150 lux", "200 lux", "300 lux"], correct: 3 },
    { id: 2, question: "The unwanted sound is termed as:", options: ["Echo", "Reverberation", "Noise/ शोर", "None of these/ इनमें से कोई नहीं"], correct: 2 },
    { id: 3, question: "How many times the hospital corridors should be cleaned in a day?", options: ["At least once/ कम से कम एक बार", "At least twice/ कम से कम दो बार", "At least thrice/ कम से कम तीन बार", "Not required at all/ बिल्कुल भी आवश्यक नहीं है"], correct: 0 },
    { id: 4, question: "Wards should be cleaned in a day with wet mop/", options: ["At least once/ कम से कम एक बार", "At least twice/ कम से कम दो बार", "At least thrice/ कम से कम तीन बार", "Not required at all/ बिल्कुल भी आवश्यक नहीं है"], correct: 0 },
    { id: 5, question: "In 2011, the number of females per thousand male in India was:", options: ["958", "973", "943", "996"], correct: 2 },
    { id: 6, question: "In 2011, the highest population density was of the state/UT/", options: ["Chandigarh", "Uttar Pradesh", "NCT, Delhi", "Bihar"], correct: 3 },
    { id: 7, question: "The highest population of the state resides below poverty line/", options: ["Uttarakhand", "Bihar", "West Bengal", "Uttar Pradesh"], correct: 3 },
    { id: 8, question: "The highly kala-azar affected states of India are:", options: ["Bihar, Delhi, Jharkhand & Uttar Pradesh", "Bihar, Jharkhand, Uttar Pradesh & West Bengal", "Bihar, Jharkhand, Madhya Pradesh & West Bengal", "Bihar, Jharkhand, Assam & West Bengal"], correct: 1 },
    { id: 9, question: "Which mosquito is anthropophilic?", options: ["Anophels culicifacies", "Aedes aegypti", "Mansonia annulifera", "Culex quinquefasciatus"], correct: 1 },
    { id: 10, question: "Causative organism of plague is:", options: ["Yercinia pestis", "Leishmania donovani", "Wuchereria bancrofti", "Xenopsylla cheopsis"], correct: 0 },
    { id: 11, question: "Mosquitoes make sounds with the help of/", options: ["Proboscis/ सूंड", "Legs", "Wings/ पंख", "Antenna"], correct: 2 },
    { id: 12, question: "Bureau of Indian Standard specification for testing Iodized Salt is ____", options: ["IS 1166 : 1986", "IS 1165 : 2002", "IS 7224 : 2006", "IS 14433 : 2007"], correct: 2 },
    { id: 13, question: "Anti-Dengue Month is observed every year in the month of:", options: ["June", "August", "September", "July"], correct: 3 },
    { id: 14, question: "NABH is the constituent board of/", options: ["Medical Council of India/ भारतीय चिकित्सा परिषद", "Quality Council of India/ भारतीय गुणवत्ता परिषद", "Pharmacy Council of India/ फार्मेसी काउंसिल ऑफ इंडिया", "None of these/ इनमें से कोई नहीं"], correct: 1 },
    { id: 15, question: "NABH stands for:", options: ["National Accreditation Board for Hospitals only", "National Accreditation Board for Healthcare providers only", "National Accreditation Board for Hospitals & Healthcare providers", "None of these/ इनमें से कोई नहीं"], correct: 2 },
    { id: 16, question: "Which is second fundamental function of solid waste management?", options: ["Collection/संग्रह", "Processing/प्रसंस्करण", "Disposal/निपटान", "Manual disposal/मैन्युअल निपटान"], correct: 1 },
    { id: 17, question: "What are the two most major gases produced by people?", options: ["Carbon dioxide and methane", "Methane and Flourine", "Methane and nitrous oxide", "Carbon dioxide and nitrous"], correct: 0 },
    { id: 18, question: "All of the following are inorganic dusts except.", options: ["Coal/कोयला", "Silica", "Cotton/कपास", "Asbestos"], correct: 2 },
    { id: 19, question: "What is the main symptoms of HIV?", options: ["Losing lots of weight quickly/जल्दी वजन कम करना", "Swelling tongue/जीभ में सुजन", "Intestin infection", "Raising blood sugar/रक्त में शर्करा बढ़ना"], correct: 0 },
    { id: 20, question: "Which virus causes rheumatic fever?", options: ["Adenovirus", "Coxserckie virus", "Rhinovirus", "Respiratory syncytial virus"], correct: 1 },
    { id: 21, question: "What are the symptoms of hypothermia?", options: ["Warm and sweaty/गर्म और पसीने से तर", "Just very sweaty/बहूत पसीना बहता है", "Cold and sweaty/ठण्ड और पसीने से तर", "Cold, tired, shivering and acting abnormally/ठण्ड, थका हुआ, कंपकंपी और असामान्य रूप से कार्य करना"], correct: 3 },
    { id: 22, question: "How many main type of wound?", options: ["1", "2", "3", "4"], correct: 1 },
    { id: 23, question: "Which of the following is poor in carotene?", options: ["Potato", "Tomato", "Cabbage", "Spinach"], correct: 0 },
    { id: 24, question: "What is virus pandemic?", options: ["A sharp and rapid epidemic involving more than one country", "An out break which recurs again and again", "A rapid global out break starting from a single focus", "A characteristic of common cold virus and HIV"], correct: 2 },
    { id: 25, question: "Maximum permission selenium in drinking water?", options: ["0.01 mg/l", "0.05 mg/l", "0.10 mg/l", "1 mg/l"], correct: 0 },
    { id: 26, question: "All of the following waste is classified under yellow category except?", options: ["Discharged medicines and cytotoxic drugs", "Soiled waste contaminated with blood/खून से सना हुआ दूषित कचरा", "Intravenous tube and sets", "Chemicals used in production of biological/जैविक के उत्पादन में प्रयुक्त रसायन"], correct: 2 },
    { id: 27, question: "Incineration is used for disposal of all of the following except?", options: ["Cytotoxic drug", "waste sharps/तीखे अपशिष्ट", "Human anatomical waste/मानव शरीरगत अपशिष्ट", "Cotton contaminated by blood/रक्त से दूषित कपास"], correct: 1 },
    { id: 28, question: "For Indian cities like Kolkatta, the per capita sewage production may be of the order of:", options: ["500 liters / 500 लीटर", "200 liters / 200 लीटर", "100 liters/ 100 लीटर", "50 liters/ 50 लीटर"], correct: 1 },
    { id: 29, question: "How many species of arthropod in public health importance?", options: ["25", "50", "100", "200"], correct: 2 },
    { id: 30, question: "Which of the following is a related to health education?", options: ["Health/स्वास्थ्य", "Sewage/मल", "Air/वायु", "Solid waste/ठोस अपशिष्ट"], correct: 0 },
    { id: 31, question: "What is the incubation period of measles?", options: ["3 days", "10 days", "21 days", "30 days"], correct: 1 },
    { id: 32, question: "What is the incubation period for diphtheria?", options: ["20 to 23 days", "10 to 13 days", "5 to 8 days", "2 to 5 days"], correct: 3 },
    { id: 33, question: "What is the caused by both physical and mental crippling?", options: ["Stroke/आघात", "Hypertension/उच्च रक्तचाप", "Leprosy/कुष्ठ रोग", "Malaria/मलेरिया"], correct: 0 },
    { id: 34, question: "Where is the best site for DPT immunization?", options: ["Gluteal", "Deltoid", "Lateral aspect of thigh/जांघ का पाश्र्व पहलू", "Forearm/बांह की कलाई"], correct: 2 },
    { id: 35, question: "Which is the method for sputum disposal?", options: ["Burning/जलाना", "Boiling/उबालना", "5% cresol", "Formaldehyde"], correct: 2 },
    { id: 36, question: "What step would you take to control bleeding from a nosebleed?", options: ["Sit casualty lean forward and pinch soft part of nose", "Sit casualty down, lean backward and inch soft part of nose", "Lie casualty down and pinch soft part of nose", "Lie casualty down and pinch top of nose"], correct: 0 },
    { id: 37, question: "What is the purpose of the “Heimlinch” procedure?", options: ["To re-locate the person", "To treat an insufficient", "To treat the absence of a victims breathings", "To remove a blockage in the victims airway"], correct: 3 },
    { id: 38, question: "What can cause the blood circulation stop?", options: ["Head wound/सर का घाव", "Bleeding in the smaller veine/छोटी नस में रक्तस्त्राव", "Heart attack/दिल का दौरा", "Bleeding in the large veine/बड़ी नस में रक्तस्त्राव"], correct: 2 },
    { id: 39, question: "How long approximately should your wash your hands?", options: ["5 seconds", "20 seconds", "1 minute", "5 minute"], correct: 1 },
    { id: 40, question: "Dental hygiene is also known as?", options: ["Brushing your teeth/अपने दांत साफ करना", "Flossing", "Oral hygiene/मौखिक स्वछता", "Tongue cleaning/जीभ की सफाई"], correct: 2 },
    { id: 41, question: "Which of the following contraceptive methods projects from pregnancy for longest duration?", options: ["Vaginal ring", "DMPA", "Norplant", "Progestasert"], correct: 2 },
    { id: 42, question: "Street refuse is called as?", options: ["Refuse that is collected from market", "Refuse that is collected from street", "Refuse that is collected from industries", "Refuse that is collected from domestic"], correct: 1 },
    { id: 43, question: "Which solid waste disposal method is cheaper and simpler?", options: ["Pulverization/दलन", "Composting/खाद", "Sanitary landfilling", "Incineration/भस्मीकरण"], correct: 2 },
    { id: 44, question: "In a rural housing the window are should be at least ____ percent of the floor area.", options: ["8", "10", "12", "15"], correct: 1 },
    { id: 45, question: "How many types of soil pollutions?", options: ["1", "3", "5", "7"], correct: 2 },
    { id: 46, question: "Residual action of malathion lasts for", options: ["1 months", "2 months", "3 months", "6 months"], correct: 2 },
    { id: 47, question: "Which of the following is true about demonstration as health education method?", options: ["Learning is passive", "Behaviour of listeners is not affected", "Dramatizes by arousing internet", "Flannelgraph"], correct: 2 },
    { id: 48, question: "Which of the following is not true about one way communication (didactic method)?", options: ["Knowledge is imposed", "Learning is authoritative", "More likely to influence human behavior", "No feedback from audience"], correct: 2 },
    { id: 49, question: "When the bacteria and viruses can enter in the body?", options: ["Oily skin/तैलीय त्वचा", "Dry skin/रुखी त्वचा", "Broken skin/फटी त्वचा", "Moist skin/नम त्वचा"], correct: 2 },
    { id: 50, question: "Which vaccine is not use for universal immunization programme?", options: ["Diphtheria", "Pertussis/काली खांसी", "Mensies", "MMR (Measles mumps rubena)"], correct: 3 },
    { id: 51, question: "Which temperature should be stored at thyroid vaccine?", options: ["+2° to +8°C", "+1° to +10°C", "-10°C to -18°C", "+1°C to +10°C"], correct: 0 },
    { id: 52, question: "How can you recognize a artrial bleeding?", options: ["Blood flows equally out of the wound", "Blood flows slowly out of the wound", "Blood flows with pulses out of the wound", "Blood flows rapid out of the wound"], correct: 2 },
    { id: 53, question: "Which is the correct ratio of chest compression to rescue breaths for in CPR an adult casualty?", options: ["2 compression : 30 rescue", "5 compression : 1 rescue", "15 compression : 2 rescue", "30 compression : 2 rescue"], correct: 3 },
    { id: 54, question: "Where do you position the knot in the end of bandage of emergency bandage?", options: ["Always on top of the bandage", "Crossed over the wound", "Clearly away from the wound", "Only cover with a sterile bandage"], correct: 2 },
    { id: 55, question: "When dressing and bandage are used?", options: ["Reduce the victim pain", "Reduce internal bleeding", "Help control bleeding prevent infection", "Make it easier to take the victim to the hospital"], correct: 2 },
    { id: 56, question: "How many times at least one wash teeth?", options: ["Once a day/दिन में एक बार", "Twice a day/दिन में दो बार", "Thrice a day/दिन में तिन बार", "Four time a day/दिन में चार बार"], correct: 1 },
    { id: 57, question: "This is a yellowish, sticky film that covers the tooth are gums?", options: ["Tartar", "Dental plaque/दन्त की मैल", "Fungi/कवक", "Protozoa"], correct: 1 },
    { id: 58, question: "What is the best way to dry items after washing them by hand?", options: ["Paper towels", "Clean, dry clothes", "Leave them to dry in the air", "A purpose designed basket"], correct: 1 },
    { id: 59, question: "How many section in Epidemic diseases act, 1897?", options: ["1", "2", "3", "4"], correct: 3 },
    { id: 60, question: "The determination of both free and combines chlorine in water with speed and accuracy is called.", options: ["Ultraviolet radiation", "Widal test", "Orthotolidine test", "Ortholidine arsenite test"], correct: 2 },
    { id: 61, question: "Nitrite level in water should not be more than?", options: ["50 mg/l", "25 mg/l", "3 mg/l", "0.3 mg/l"], correct: 2 },
    { id: 62, question: "Which of the following colour code is not used in biomedical wastes management rules (2016)?", options: ["Black/काला", "Red/लाल", "Yellow/पिला", "Blue/नीला"], correct: 0 },
    { id: 63, question: "Which is the time read after tuberculin test?", options: ["96 hrs", "72 hrs", "48 hrs", "24 hrs"], correct: 1 },
    { id: 64, question: "Which vector causes by Q fever?", options: ["Tick", "Mite", "Louse", "Fly"], correct: 0 },
    { id: 65, question: "Which type of cancer can be prevented by vaccination?", options: ["Oral cavity cancer", "Stomach cancer/आमाशय का कैंसर", "Cervical cancer/ग्रीवा कैंसर", "Blood cancer/रक्त कैंसर"], correct: 2 },
    { id: 66, question: "Which of the following vaccine done by shacke test?", options: ["Meningitis", "Diphtheria", "BCG", "Poliomyelities"], correct: 3 },
    { id: 67, question: "Which of the following should be checked when giving vaccine?", options: ["If the skin is clean no further cleaning is necessary", "The skin should be disinfected prior to administering any vaccine", "Only visible dirt skin need to be wasted with soap and water", "The needle should be sufficiently long (25mm)"], correct: 1 },
    { id: 68, question: "What will you do for a chemical burn?", options: ["Flush with water, dry and cover", "Flush with large amount of water and cover", "Flush with large amount of warm water until help arrives", "Flush with large amount of cool water until help arrives"], correct: 3 },
    { id: 69, question: "What name are given to the three different depths of burns?", options: ["Small, medium and large", "First, second and third degree", "Minor, medium and severe", "Superficial, partial thickness, full thickness"], correct: 3 },
    { id: 70, question: "What are the symptoms of third degree burn?", options: ["Charred skin, on pain", "Charred skin pain", "Red and pain", "Grey and pain"], correct: 0 },
    { id: 71, question: "What do you have to be done when a passenger has not breathing?", options: ["Start CPR immediately", "Put the victim in the recovery position", "Count pulsations", "Continue with the breathing"], correct: 0 },
    { id: 72, question: "Which of the following benefits not been provided under the employees state insurance act 1948?", options: ["Sickness benefit", "Unemployment allowance", "Children's allowance", "Disablement benefit"], correct: 2 },
    { id: 73, question: "What will be the BMI of male whose weight is 89 kg and height is 172 cm?", options: ["27", "30", "33", "36"], correct: 1 },
    { id: 74, question: "All of the following are anti larval measures except.", options: ["Intermittent Irrigation", "Gambusia affinis", "DDT", "Paris green"], correct: 2 },
    { id: 75, question: "Which of the following component of cigarette smoke predisposes to lung cancer?", options: ["Nicotine", "Carbon monoxide", "Tar", "Nitro samine"], correct: 2 },
    { id: 76, question: "Which day observed on world mental health day?", options: ["10 October", "14 December", "5 June", "8 April"], correct: 0 },
    { id: 77, question: "Which of the following are true regarding measles vaccine except?", options: ["Free ZC tries attenvated vaccine", "Single IM dose of 0.5 ml", "IS associated with TSS", "Contraindicates in Pregnancy"], correct: 1 },
    { id: 78, question: "Which of the following methods destroy vibrio cholera except?", options: ["Boiling/उबालना", "Drying/सुखाना", "Bleaching powder 1mg/L", "Cresol"], correct: 1 },
    { id: 79, question: "What is your first action when examining the condition of a patient?", options: ["Check for breathing", "Check for insurance", "Speak to the victim and shock his shoulders", "Check for externals injuries"], correct: 2 },
    { id: 80, question: "What is an open fracture?", options: ["A fracture in which the bone ends can move around", "A fracture in which the bone is exposed as the skin is broken", "A fracture which causes complicated such as punctured lung", "A fracture in which two bone has bent and split"], correct: 1 },
    { id: 81, question: "Which of the following not true about importance of exercises?", options: ["Lose weight", "Lower risk of diseases", "Improves physical activity", "Improvement of good speech"], correct: 3 }
];

const EXAM_QUESTION_COUNT = 50;
const MARKS_PER_QUESTION = 2;

// --- Helper Functions ---
const shuffleArray = (array) => {
    // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- React Components ---
const QuestionCard = ({ question, qNumber, onAnswerChange, userAnswer }) => {
    return (
        <div className="question-card" role="group" aria-labelledby={`q${question.id}-text`}>
            <p className="question-text" id={`q${question.id}-text`}>
                {qNumber}. {question.question}
            </p>
            <ul className="options-list">
                {question.options.map((option, index) => (
                    <li key={index} className="option-item">
                        <label>
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={index}
                                checked={userAnswer === index}
                                onChange={() => onAnswerChange(question.id, index)}
                            />
                            <span>{option}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ResultScreen = ({ score, correctAnswers, totalQuestions, onRetake }) => {
    const incorrectAnswers = totalQuestions - correctAnswers;
    const totalPossibleScore = totalQuestions * MARKS_PER_QUESTION;

    return (
        <div className="result-content" role="alert">
            <div className="result-summary">
                <h2>Exam Finished!</h2>
                <p>Your Score</p>
                <p className="score">{score} / {totalPossibleScore}</p>
                <p>
                    <span className="correct">{correctAnswers} Correct</span> | <span className="incorrect">{incorrectAnswers} Incorrect</span>
                </p>
            </div>
            <div className="button-container">
                 <button className="btn btn-retake" onClick={onRetake}>Retake Exam</button>
            </div>
        </div>
    );
}

const App = () => {
    const [examState, setExamState] = useState('not_started'); // not_started, in_progress, finished
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

    const startExam = () => {
        const shuffled = shuffleArray([...allQuestions]);
        setQuestions(shuffled.slice(0, EXAM_QUESTION_COUNT));
        setUserAnswers({});
        setScore(0);
        setCorrectAnswersCount(0);
        setExamState('in_progress');
    };
    
    useEffect(() => {
        startExam();
    }, []);

    const handleAnswerChange = (questionId, answerIndex) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    };

    const handleFinishExam = () => {
        let currentScore = 0;
        let correctCount = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correct) {
                currentScore += MARKS_PER_QUESTION;
                correctCount++;
            }
        });
        setScore(currentScore);
        setCorrectAnswersCount(correctCount);
        setExamState('finished');
        window.scrollTo(0, 0);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>ITI Health Sanitary Inspector CBT Exam</h1>
            </header>
            <main>
                {examState === 'in_progress' && (
                    <div className="exam-content">
                        {questions.map((q, index) => (
                            <QuestionCard
                                key={q.id}
                                question={q}
                                qNumber={index + 1}
                                onAnswerChange={handleAnswerChange}
                                userAnswer={userAnswers[q.id]}
                            />
                        ))}
                        <div className="button-container">
                            <button className="btn" onClick={handleFinishExam}>Finish Exam</button>
                        </div>
                    </div>
                )}
                {examState === 'finished' && (
                    <ResultScreen
                        score={score}
                        correctAnswers={correctAnswersCount}
                        totalQuestions={EXAM_QUESTION_COUNT}
                        onRetake={startExam}
                    />
                )}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
