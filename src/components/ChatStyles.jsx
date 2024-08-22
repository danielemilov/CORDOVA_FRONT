import styled from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #000000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

export const Header = styled.div`
  background-color: #0000003b;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333333;
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
`;

export const Username = styled.span`
  font-weight: bold;
  font-size: 18px;
`;

export const MessageContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #0000003b;
`;

export const MessageWrapper = styled.div`
  display: flex;
  flex-direction: ${props => props.$isSentByCurrentUser ? 'row-reverse' : 'row'};
  margin-bottom: 10px;
`;

export const MessageBubble = styled.div`
  max-width: 60%;
  padding: 10px 15px;
  border-radius: 15px;
  background-color: ${props => props.$isSentByCurrentUser ? '#007AFF' : '#333333'};
  color: white;
  position: relative;
`;

export const MessageContent = styled.p`
  margin: 0;
  word-wrap: break-word;
`;

export const MessageTime = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  position: absolute;
  bottom: -20px;
  ${props => props.$isSentByCurrentUser ? 'right' : 'left'}: 5px;
`;

export const InputContainer = styled.div`
  display: flex;
  padding: 15px;
  background-color: #0000003b;
  border-top: 1px solid #333333;
`;

export const StyledInput = styled.input`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  background-color: #333333;
  color: white;
  font-size: 16px;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
`;

export const TypingIndicator = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-left: 10px;
`;

export const DeletedMessageBubble = styled(MessageBubble)`
  background-color: #444444;
  font-style: italic;
`;

export const EditedTag = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 5px;
`;

export const OptionsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px;
`;

export const OptionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.className === 'delete' ? '#ff4d4d' : '#007AFF'};
  cursor: pointer;
  font-size: 14px;
`;

export const MessageStatus = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
  margin-top: 5px;
`;

export const SeenIndicator = styled.img`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-left: 5px;
  vertical-align: middle;
`;

export const DateSeparator = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  margin: 20px 0;
  font-size: 14px;
`;

export const VoiceMessageContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #444444;
  border-radius: 15px;
  padding: 10px;
  margin-bottom: 10px;
`;

export const VoicePreview = styled.div`
  display: flex;
  align-items: center;
  background-color: #333333;
  border-radius: 25px;
  padding: 5px 15px;
`;

export default {
  ChatContainer,
  Header,
  Avatar,
  Username,
  MessageContainer,
  MessageWrapper,
  MessageBubble,
  MessageContent,
  MessageTime,
  InputContainer,
  StyledInput,
  TypingIndicator,
  DeletedMessageBubble,
  EditedTag,
  OptionsContainer,
  OptionButton,
  MessageStatus,
  SeenIndicator,
  DateSeparator,
  VoiceMessageContainer,
  VoicePreview
};