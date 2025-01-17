import { css } from "@emotion/react";


export const chatContainer = css`
  width: 400px;
  margin: 20px auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
`;

export const messageBubble = css`
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  padding: 10px;
  border-radius: 20px;
  max-width: 70%;
  clear: both;
  position: relative;
`;

export const userMessage = css`
  background-color: #e0f2f7;
  align-self: flex-end;
`;

export const otherMessage = css`
  background-color: #ffffff;
  align-self: flex-start;
`;

export const messageContent = css`
  margin-left: 10px;
  flex-grow: 1;
  word-wrap: break-word;
`;

export const messageTimestamp = css`
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  white-space: nowrap;
`;
export const messageActions = css`
    position: absolute;
    bottom: 5px;
    right: 5px;
    display: flex;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
`;
export const actionButton = css`
    background-color: transparent;
    border: none;
    color: #999;
    padding: 2px 5px;
    margin-left: 3px;
    cursor: pointer;
    font-size: 12px;
    &:hover{
        color: #333;
    }
`;
export const inputArea = css`
  padding: 10px;
`;