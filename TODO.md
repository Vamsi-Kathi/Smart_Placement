# MockInterview + Dashboard + ResumeAnalyzer Fix Plan

- [x] Analyze current MockInterview.jsx and project Firebase setup
- [x] Get user approval for plan
- [x] Fix all broken JSX (missing closing tags in Setup, Active Interview, Report screens)
- [x] Harden Firebase save logic (admin-bypass check, isolated try/catch, success indicator)
- [x] Add maxQuestions limit with auto-conclude (prevents infinite interviews & token burn)
- [x] Add question count selector to setup screen (3 / 5 / 10 questions)
- [x] Update getSystemPrompt to tell AI current question number & final question cue
- [x] Add autoConcludeInterview helper that grades final answer after maxQuestions
- [x] Guard processTextAnswer & processAudioPayload to auto-stop at maxQuestions
- [x] Update Dashboard.jsx to read from new Firebase locations (latestMockInterview.score, totalInterviewsDone) with backwards-compatible fallbacks
- [x] Fix ResumeAnalyzer.jsx model name (gemini-2.5-flash → gemini-1.5-flash)
- [x] Fix ResumeAnalyzer.jsx Firebase "Accidental Wipe" bug (use dot notation "performance.atsScore" instead of replacing whole performance object)
- [x] Verify all files compile correctly


