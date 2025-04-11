import React from "react";
import TypingCodeEditor from "./typing-code-editor";


const ExamplePage: React.FC = () => {
  // Example code chunks with comments
  const codeChunks = [
    {
      code: "import React from 'react';",
      comment: "We need to import React to create components",
      user: {
        name: "John Doe",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=John"
      }
    },
    {
      code: "// No shadcn imports needed",
      comment: "Using plain Tailwind instead",
      user: {
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Jane"
      }
    },
    {
      code: "const MyComponent = () => {",
      comment: "Starting our functional component",
      user: {
        name: "Alex Brown"
      }
    },
    {
      code: "  const [count, setCount] = React.useState(0);",
      comment: "Using state to track count",
      user: {
        name: "John Doe",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=John"
      }
    },
    {
      code: "  ",
      // No comment for this empty line
    },
    {
      code: "  const handleIncrement = () => {",
      comment: "Function to increase counter",
      user: {
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Jane"
      }
    },
    {
      code: "    setCount(prevCount => prevCount + 1);",
      comment: "Using functional update for state changes",
      user: {
        name: "Alex Brown"
      }
    },
    {
      code: "  };",
    },
    {
      code: "  ",
    },
    {
      code: "  return (",
      comment: "Rendering our UI",
      user: {
        name: "John Doe",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=John"
      }
    },
    {
      code: "    <div className=\"p-4 space-y-4\">",
    },
    {
      code: "      <h1 className=\"text-2xl font-bold\">Counter: {count}</h1>",
      comment: "Displaying the current count",
      user: {
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Jane"
      }
    },
    {
      code: "      <button",
    },
    {
      code: "        onClick={handleIncrement}",
    },
    {
      code: "        className=\"px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700\"",
    },
    {
      code: "      >",
    },
    {
      code: "        Increment",
    },
    {
      code: "      </button>",
      comment: "Simple button with Tailwind styling",
      user: {
        name: "Alex Brown"
      }
    },
    {
      code: "    </div>",
    },
    {
      code: "  );",
    },
    {
      code: "};",
    },
    {
      code: "",
    },
    {
      code: "export default MyComponent;",
      comment: "Exporting for use elsewhere",
      user: {
        name: "John Doe",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=John"
      }
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Code Generation Demo</h1>
      <TypingCodeEditor 
        codeChunks={codeChunks} 
        typingSpeed={30} 
        monacoTheme="vs-dark"
        className="shadow-lg"
      />
    </div>
  );
};

export default ExamplePage;