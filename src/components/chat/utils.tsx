import { EuiButton } from '@elastic/eui';
import Image from 'next/image';

export const extractMessage = (messageStr: string | null | undefined, isShort: Boolean = false): string | JSX.Element | null => {
  if (!messageStr) {
    return null;
  }

  try {
    const fixedStr = messageStr.replace(/'/g, '"').replace(/False/g, "false");
    const obj = JSON.parse(fixedStr);
    
    if (Array.isArray(obj)) {
      // Short text representation
      if (isShort) {
        const messageTypes = obj.map(item => item.type);
        
        if (messageTypes.includes('text')) {
          const textItem = obj.find(item => item.type === 'text');
          const text = textItem?.payload?.text || '';
          return text.length > 20 ? text.substring(0, 20) + '...' : text;
        } else if (messageTypes.includes('image')) {
          return "Зураг илгээсэн";
        } else if (messageTypes.includes('file')) {
          return "Файл илгээсэн";
        } else if (messageTypes.includes('video')) {
          return "Видео илгээсэн";
        } else if (messageTypes.includes('audio')) {
          return "Аудио илгээсэн";
        } else {
          return "Мессеж илгээсэн";
        }
      }
      
      // Full content representation
      return (
        <>
          {obj.map((item, i) => {
            if (item.type === "text") {
              return <p key={`${item.type}-${i}`}>{item.payload.text}</p>;
            } else if (item.type === "image") {
              return (
                <Image
                  key={`${item.type}-${i}`}
                  src={item.payload.url}
                  alt="image"
                  width={50}
                  height={50}
                />
              );
            } else if (item.type === "file") {
              return (
                <div key={`${item.type}-${i}`}>
                  <p>File: {item.payload.name || 'Attached file'}</p>
                  <EuiButton size="s" href={item.payload.url} download>
                    Download
                  </EuiButton>
                </div>
              );
            } else if (item.type === "video") {
              return (
                <video 
                  key={`${item.type}-${i}`}
                  controls
                  width="250"
                  height="150"
                  src={item.payload.url}
                >
                  <source src={item.payload.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              );
            } else if (item.type === "audio") {
              return (
                <audio 
                  key={`${item.type}-${i}`}
                  controls
                  src={item.payload.url}
                >
                  <source src={item.payload.url} type={item.payload.mime_type || "audio/mpeg"} />
                  Your browser does not support the audio element.
                </audio>
              );
            } else {
              return <p key={`${item.type}-${i}`}>Unsupported message type: {item.type}</p>;
            }
          })}
        </>
      );
    }
  } catch (error) {
    return isShort ? messageStr.substring(0, 20) + "..." : messageStr;
  }
};

export const getImgUrl = (str: string | null | undefined): string | null => {
  if (!str) {
    return null;
  }

  try {
    const fixedStr = str.replace(/'/g, '"').replace(/False/g, "false");
    const obj = JSON.parse(fixedStr);
    return obj?.data?.url;
  } catch (error) {
    return null;
  }
};
