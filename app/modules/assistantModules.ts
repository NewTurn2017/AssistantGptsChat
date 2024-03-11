// Type: Module
// assistantModules.ts
import { convertFileToBase64 } from '../utils/convertFileToBase64';
import {
  uploadImageAndGetDescription,
  uploadFile,
  createAssistant,
  createThread,
  runAssistant,
  deleteFile,
} from '../services/api';

interface AssistantDetails {
  assistantName: string;
  assistantModel: string;
  assistantDescription: string;
}

interface UploadedFileResponse {
  fileId: string;
}

interface AssistantDataResponse {
  assistantId: string;
}

interface ThreadDataResponse {
  threadId: string;
}


/**
* Prepares and uploads a file for the chat assistant.
* This can include converting images to base64, handling different file types, etc.
* @param {File} file - The file to be uploaded.
* @returns {Promise<string>} - The ID of the uploaded file.
*/
export const prepareUploadFile = async (file: File, setStatusMessage: (message: string) => void): Promise<string> => {
  setStatusMessage('업로드할 파일 준비 중...');

  // If the file is an image, get a description from GPT-4 Vision API
  if (file.type.startsWith('image/')) {
    setStatusMessage('Converting image to base64...');
    const base64Image = await convertFileToBase64(file);

    setStatusMessage('이미지를 Base64로 변환...');
    const descriptionResponse = await uploadImageAndGetDescription(base64Image);

    setStatusMessage('이미지 설명 파일 제작 중...');
    const descriptionBlob = new Blob([descriptionResponse.analysis], { type: 'text/plain' });
    const descriptionFile = new File([descriptionBlob], 'description.txt');

    setStatusMessage('설명 파일 업로드...');
    const uploadedFile: UploadedFileResponse = await uploadFile(descriptionFile);
    setStatusMessage('설명 파일이 성공적으로 업로드되었습니다. 파일 ID: ' + uploadedFile.fileId);
    return uploadedFile.fileId;
  }

  // If the file is not an image, upload it as a normal file
  setStatusMessage('파일 업로드 중...');
  const uploadedFile: UploadedFileResponse = await uploadFile(file);
  console.log('Uploaded file response:', uploadedFile); // Add this line
  setStatusMessage('파일 업로드 성공. 파일 ID: ' + uploadedFile.fileId);
  return uploadedFile.fileId;
};



/**
* Initializes a chat assistant with the given details.
* @param {Object} assistantDetails - Details of the assistant to be created.
* @param {string} fileId - The ID of the uploaded file associated with the assistant.
* @returns {Promise<string>} - The ID of the created assistant.
*/
export const initializeAssistant = async (assistantDetails: AssistantDetails, fileIds: string[]): Promise<string> => {
  console.log('Initializing assistant...');
  
  // Log the assistantDetails and fileIds
  console.log('(initialize) -> Assistant Details:', assistantDetails);
  console.log('(initialize) -> File IDs:', fileIds);

  const assistantData: AssistantDataResponse = await createAssistant(
      assistantDetails.assistantName,
      assistantDetails.assistantModel,
      assistantDetails.assistantDescription,
      fileIds
  );

  console.log('Assistant created successfully. Assistant ID:', assistantData.assistantId);
  return assistantData.assistantId; 
};

/**
* Creates a chat thread with the initial message.
* @param {string} inputMessage - The initial message for the thread.
* @returns {Promise<string>} - The ID of the created thread.
*/
export const createChatThread = async (inputMessage: string): Promise<string> => {
  console.log('Creating chat thread...');
  const threadData: ThreadDataResponse = await createThread(inputMessage);
  console.log('Chat thread created successfully. Thread ID:', threadData.threadId);
  return threadData.threadId;
};




/**
* Runs the chat assistant for a given thread.
* @param {string} assistantId - The ID of the assistant.
* @param {string} threadId - The ID of the thread.
* @returns {Promise<void>} - A promise that resolves when the assistant is successfully run.
*/
export const runChatAssistant = async (assistantId: string, threadId: string): Promise<string | null> => {
  
  console.log('Running chat assistant...');

  const response = await runAssistant(assistantId, threadId);
  const runId = response.runId;

  console.log('Chat assistant run successfully. Run ID:', runId);
  return runId; 
};

/**
* Deletes a file from the chat assistant.
* @param {string} fileId - The ID of the file to be deleted.
* @returns {Promise<boolean>} - The status of the deletion.
*/
export const deleteUploadedFile = async (fileId: string, setStatusMessage: (message: string) => void): Promise<boolean> => {
  setStatusMessage(`Gona Deleting file with ID: ${fileId}...`);
  console.log(`Gonna Deleting file with ID: ${fileId}...`);

  try {
    const deletionStatus = await deleteFile(fileId);
    setStatusMessage(`File with ID: ${fileId} deleted successfully.`);
    console.log(`File with ID: ${fileId} deleted successfully.`);
    return deletionStatus;
  } catch (error) {
    setStatusMessage(`Error deleting file with ID: ${fileId}.`);
    console.error('Error deleting file:', error);
    return false;
  }
};