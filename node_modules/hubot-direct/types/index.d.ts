// Copyright (c) 2023 L is B Corp.
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import hubot from 'lisb-hubot';
import directJs from './direct-js';

declare namespace daab {
  interface Direct extends hubot.Adapter {
    announce(envelope: hubot.Envelope, ...strings: string[]): void;
    download(
      envelope: hubot.Envelope,
      remoteFile: RemoteFile,
      callback: (path: string, err: Error | unknown) => void
    ): void;
    leave(envelope: hubot.Envelope, user?: directJs.User): void;
    users(domainId?: string): any[];
    talks(): any[];
    domains(): any[];
  }

  interface JoinMessage extends hubot.Message {}

  interface Mention {
    user: { id: string };
  }

  type ExtendedResponse<M extends hubot.Message> = {
    message: M;

    send(...content: SendableContent[]): void;
    download(file: RemoteFile, callback: (path: string) => void): void;
    announce(...content: string[]): void;
    leave(user?: { id: string }): void;
  };

  interface Response<M extends hubot.Message>
    extends Omit<hubot.Response<Direct, M>, 'message' | 'send'>,
      ExtendedResponse<M> {}

  interface ResponseWithJson<T extends JsonContent> extends Response<hubot.TextMessage> {
    json: T;
  }

  type ListenerCallback<M extends hubot.Message> = (response: Response<M>) => void;

  type MessageId = string;
  type SelectResponse = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  enum TaskClosingType {
    Any = 0,
    All = 1,
  }

  type SendableContent =
    | string
    | Text
    | (Text & SendTextHandler)
    | Stamp
    | (Stamp & SendStampHandler)
    | OriginalStamp
    | (OriginalStamp & SendOriginalStampHandler)
    | YesNo
    | (YesNo & SendYesNoHandler)
    | Select
    | (Select & SendSelectHandler)
    | Task
    | (Task & SendTaskHandler)
    | Note
    | (Note & SendNoteHandler)
    | CloseYesNo
    | CloseSelect
    | CloseTask
    | AttachmentFile
    | AttachmentFiles
    | ReplyResponse<boolean>
    | ReplyResponse<SelectResponse>
    | ReplyTask;

  type Text = { text: string };
  type Stamp = { stamp_set: string; stamp_index: string; text?: string };
  type OriginalStamp = { stampset_id: string; stamp_id: string; text?: string };
  type YesNo = { question: string };
  type CloseYesNo = { close_yesno: MessageId };
  type Select = { question: string; options: string[] };
  type CloseSelect = { close_select: MessageId };
  type Task = { title: string; closing_type: TaskClosingType };
  type CloseTask = { close_task: MessageId };
  type Note = directJs.CreateNoteParams;
  type AttachmentFile = directJs.LocalFile;
  type AttachmentFiles = {
    path: string[];
    name?: string[];
    type?: string[];
    text?: string;
  };
  type ReplyResponse<R> = { in_reply_to: MessageId; response: R };
  type ReplyTask = { in_reply_to: MessageId; done: boolean };

  type SentText = Sent<Text>;
  type SentStamp = Sent<Stamp>;
  type SentOriginalStamp = Sent<OriginalStamp>;
  type SentYesNo = SentAction<YesNoAnswer, YesNo>;
  type SentSelect = SentAction<SelectAnswer, Select>;
  type SentTask = SentAction<TaskAnswer, Task>;
  type SentNote = { note: directJs.Note };

  type YesNoAnswer = (trues: directJs.User[], falses: directJs.User[]) => void;
  type SelectAnswer = (options: Array<directJs.User[]>) => void;
  type TaskAnswer = (dones: directJs.User[], undones: directJs.User[]) => void;

  type SendTextHandler =
    | OnSend<SentText>
    | WithOnReadStatusHandler<SentText>
    | WithReadStatusProperties<SentText>;
  type SendStampHandler =
    | OnSend<SentStamp>
    | WithOnReadStatusHandler<SentStamp>
    | WithReadStatusProperties<SentStamp>;
  type SendOriginalStampHandler =
    | OnSend<SentOriginalStamp>
    | WithOnReadStatusHandler<SentOriginalStamp>
    | WithReadStatusProperties<SentOriginalStamp>;
  type SendYesNoHandler =
    | OnSend<SentYesNo>
    | WithOnReadStatusHandler<SentYesNo>
    | WithReadStatusProperties<SentYesNo>;
  type SendSelectHandler =
    | OnSend<SentSelect>
    | WithOnReadStatusHandler<SentSelect>
    | WithReadStatusProperties<SentSelect>;
  type SendTaskHandler =
    | OnSend<SentTask>
    | WithOnReadStatusHandler<SentTask>
    | WithReadStatusProperties<SentTask>;
  type SendNoteHandler = OnSend<SentNote>;

  type WithOnReadStatusHandler<S> = OnRead<
    (
      readNowUsers: directJs.User[],
      readUsers: directJs.User[],
      unreadUsers: directJs.User[]
    ) => void
  > &
    OnSend<S>;
  type WithReadStatusProperties<S> = OnRead<() => true> &
    OnSend<S & { readUsers: directJs.User[]; unreadUsers: directJs.User[] }>;
  type OnRead<H> = { onread: H };
  type OnSend<S> = { onsend: (sent: S) => void };

  type Sent<C> = { message: SentMessage<C> };
  type SentAction<H, C> = Sent<C & { listing: boolean }> & {
    answer: SentAnswer<H>;
  };
  type SentAnswer<H> = (cb: H) => void;
  type SentMessage<C> = { id: MessageId; type: number; content: C };

  type JsonContent =
    | Stamp
    | OriginalStamp
    | YesNoWithResponse
    | SelectWithResponse
    | TaskWithResponse
    | RemoteFile
    | RemoteFiles
    | ActualLocation
    | NoteCreated
    | NoteUpdated
    | NoteDeleted;

  type YesNoWithResponse = YesNo & { response?: boolean };
  type SelectWithResponse = Select & { response?: SelectResponse };
  type TaskWithResponse = Task & { done?: boolean };

  type RemoteFile = directJs.RemoteFile;
  type RemoteFiles = {
    files: RemoteFile[];
    text?: string;
  };

  type ActualLocation = {
    place: string;
    lat: number;
    lng: number;
  };

  type NoteCreated = {
    note_id: string;
    title: string;
    revision: number;
    has_attachments?: boolean;
  };

  type NoteUpdated = {
    note_id: string;
    title: string;
    revision: number;
    has_attachments?: boolean;
  };

  type NoteDeleted = {
    note_id: string;
    title: string;
  };

  type RespondType =
    | 'stamp'
    | 'original_stamp'
    | 'yesno'
    | 'select'
    | 'task'
    | 'file'
    | 'files'
    | 'map'
    | 'note_created'
    | 'note_updated'
    | 'note_deleted';

  type ListenerCallbackWithJson<R extends RespondType> = R extends 'stamp'
    ? (res: ResponseWithJson<Stamp>) => void
    : R extends 'original_stamp'
    ? (res: ResponseWithJson<OriginalStamp>) => void
    : R extends 'yesno'
    ? (res: ResponseWithJson<YesNoWithResponse>) => void
    : R extends 'select'
    ? (res: ResponseWithJson<SelectWithResponse>) => void
    : R extends 'task'
    ? (res: ResponseWithJson<TaskWithResponse>) => void
    : R extends 'file'
    ? (res: ResponseWithJson<RemoteFile>) => void
    : R extends 'files'
    ? (res: ResponseWithJson<RemoteFiles>) => void
    : R extends 'map'
    ? (res: ResponseWithJson<ActualLocation>) => void
    : R extends 'note_created'
    ? (res: ResponseWithJson<NoteCreated>) => void
    : R extends 'note_updated'
    ? (res: ResponseWithJson<NoteUpdated>) => void
    : R extends 'note_deleted'
    ? (res: ResponseWithJson<NoteDeleted>) => void
    : never;
}

export = daab;
export as namespace daab;

declare global {
  namespace Hubot {
    interface Brain<A extends Adapter> {
      users(): { [id: string]: directJs.User };
      userForId(id: string, domainId?: string): directJs.User | User; // NOTE: get or create
      userForName(name: string, domainId?: string): directJs.User | null;
      usersForRawFuzzyName(fuzzyName: string, domainId?: string): directJs.User[];
      usersForFuzzyName(fuzzyName: string, domainId?: string): directJs.User[];

      rooms(): { [id: string]: directJs.Talk };
      domains(): { [id: string]: directJs.Domain };
    }

    interface Message {
      roomType: directJs.TalkType;
      roomTopic: string;
      roomUsers: directJs.User[];
      rooms: { [id: string]: directJs.Talk };
    }

    interface TextMessage {
      constructor(
        user: User,
        text: string,
        id: string,
        mention?: { all: boolean; me: boolean; data: daab.Mention[] }
      ): TextMessage;

      mentionAll?: boolean;
      mentionMe?: boolean;
      mentions?: daab.Mention[];
    }

    interface Robot<A extends Adapter = Adapter> {
      readonly direct: A extends daab.Direct ? directJs.DirectAPI : never;

      respond(regex: RegExp, callback: daab.ListenerCallback<TextMessage>): void;
      respond<R extends daab.RespondType>(
        type: R,
        callback: daab.ListenerCallbackWithJson<R>
      ): void;

      hear(regex: RegExp, callback: daab.ListenerCallback<TextMessage>): void;
      hear<R extends daab.RespondType>(type: R, callback: daab.ListenerCallbackWithJson<R>): void;

      leave(callback: daab.ListenerCallback<LeaveMessage>): void;
      join(callback: daab.ListenerCallback<daab.JoinMessage>): void;

      send(envelope: { room: string }, ...contents: daab.SendableContent[]): void;
      reply(envelope: { room: string; user: User }, ...contents: daab.SendableContent[]): void;

      announce(domain: { id: string }, ...contents: string[]): void;

      roomTopic(envelope: { room: string }, ...contents: string[]): void;
    }
  }
}
