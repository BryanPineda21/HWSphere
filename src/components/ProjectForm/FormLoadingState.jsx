const FormLoadingState = ({ message = "Loading...", subMessage = "" }) => {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-700 border-solid rounded-full"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-green-600 dark:border-t-green-500 border-solid rounded-full absolute top-0 left-0 animate-spin" style={{ animationDuration: '1s' }}></div>
        </div>
        <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">{message}</p>
        {subMessage && <p className="text-sm text-zinc-500">{subMessage}</p>}
      </div>
    );
  };
  
  export default FormLoadingState;