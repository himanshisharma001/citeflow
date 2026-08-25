import React, { useState, useRef } from "react";
import { Navbar } from "./components/Navbar";
import { PdfViewer } from "./components/PdfViewer";
import { ChatStudio } from "./components/ChatStudio";
import { ChatSidebar } from "./components/ChatSidebar";
import { AuthModal } from "./components/AuthModal";
import { useChatSessions } from "./hooks/useChatSessions";
import { useChatStream } from "./hooks/useChatStream";
import { pdfjs } from "react-pdf";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("citeflow_user");
      const token = localStorage.getItem("citeflow_token");
      return saved && token ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [activeHighlightPage, setActiveHighlightPage] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState("pdf");
  const [extractedPages, setExtractedPages] = useState([]);
  const [statusText, setStatusText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fileInputRef = useRef(null);

  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    currentSession,
    createNewSession,
    deleteSession,
    updateActiveMessages,
  } = useChatSessions();

  const { isStreaming, cooldownSeconds, sendMessage, stopStream } =
    useChatStream("http://localhost:5000");

  const handleLogout = () => {
    localStorage.removeItem("citeflow_token");
    localStorage.removeItem("citeflow_user");
    setCurrentUser(null);
    setFile(null);
    setFileName("");
    setExtractedPages([]);
    setIsSidebarOpen(false);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || selectedFile.type !== "application/pdf") return;

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setStatusText("Reading PDF...");

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const pagesData = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        pagesData.push({
          pageNumber: i,
          text: pageText,
        });
      }

      setExtractedPages(pagesData);
      setNumPages(pdf.numPages);
      setStatusText("Ready");
    } catch (err) {
      console.error("PDF Read Error:", err);
      setStatusText("Read Error");
    }
  };

  const handleSendMessage = async (prompt) => {
    await sendMessage(
      prompt,
      extractedPages,
      currentSession?.messages || [],
      (updatedList) => {
        updateActiveMessages(updatedList);
      },
    );
  };

  const handleClearChat = () => {
    updateActiveMessages([
      {
        role: "assistant",
        content:
          "Upload a document to begin. When answering questions, citations will appear like [Page 1] for direct navigation.",
      },
    ]);
  };

  const handleJumpToPage = (pageNumber) => {
    if (window.innerWidth < 768) {
      setActiveMobileTab("pdf");
    }

    setTimeout(() => {
      const targetElement = document.getElementById(`pdf-page-${pageNumber}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setActiveHighlightPage(pageNumber);

        setTimeout(() => {
          setActiveHighlightPage(null);
        }, 2500);
      }
    }, 150);
  };

  // If user is not authenticated, display only the login interface
  if (!currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090d16]">
        <AuthModal
          isOpen={!currentUser}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            createNewSession(); // Instantly activates a clean new chat tab
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="application/pdf"
        className="hidden"
      />

      <Navbar
        documentName={statusText ? `${fileName} (${statusText})` : fileName}
        pageCount={numPages}
        onUploadClick={handleUploadClick}
        activeMobileTab={activeMobileTab}
        setActiveMobileTab={setActiveMobileTab}
        user={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <ChatSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewChat={createNewSession}
          onDeleteSession={deleteSession}
        />

        <main className="flex-1 flex overflow-hidden relative w-full">
          <PdfViewer
            file={file}
            numPages={numPages}
            setNumPages={setNumPages}
            activeHighlightPage={activeHighlightPage}
            onUploadClick={handleUploadClick}
            isVisibleMobile={activeMobileTab === "pdf"}
          />
          <ChatStudio
            onCitationClick={handleJumpToPage}
            messages={currentSession?.messages || []}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            isStreaming={isStreaming}
            cooldownSeconds={cooldownSeconds}
            onStopStream={stopStream}
            isVisibleMobile={activeMobileTab === "chat"}
            hasDocument={Boolean(file)}
          />
        </main>
      </div>
    </div>
  );
}
