import React from 'react'

interface MessageProps{
  content:string;
isUserMessage: boolean;
}


const Message = ({content, isUserMessage}: MessageProps) => {

  const filteredContent = content.startsWith("Reponds en Français :")? content.replace("Reponds en Français :", ""):content
  return (
    <div className={`flex w-full ${isUserMessage? 'justify-end': ''}`}>
      <div className={`max-w-4xl p-4 brake-works ${isUserMessage? 'bg-base-300 rounded-3xl': 'w-full'}`}>
{filteredContent}
      </div>
      
    </div>
  )
}

export default Message
