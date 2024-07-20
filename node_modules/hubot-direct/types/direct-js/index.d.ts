// Copyright (c) 2023 L is B Corp.
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

declare namespace directJs {
  interface Int64 {
    high: number;
    low: number;
  }

  interface User {
    id: string;
    id_i64: Int64;
    name: string;
    displayName: string;
    canonicalDisplayName: string;
    phoneticDisplayName: string | null;
    canonicalPhoneticDisplayName: string | null;
    email?: string;
    profile_url?: string;
    updatedAt: Int64;
  }

  interface Domain {
    id: string;
    id_i64: Int64;
    domainInfo: {
      name: string;
      logoUrl: string | null;
      frozen: boolean;
    };
    closed: boolean;
    contract: any; // TODO
    profileDefinition: any; // TODO
    setting: any; // TODO
    role: any; // TODO
  }

  enum TalkType {
    Unknown = 0,
    Pair = 1,
    Group = 2,
  }

  interface Talk {
    id: string;
    id_i64: Int64;
    domainId: string;
    domainId_i64: Int64;
    type: TalkType;
    name: string | null;
    topic: string | null;
    iconUrl: string | null;
    userIds: Int64[];
    guestIds: null;
    leftUsers: any[]; // TODO
    users: User[];
    domain: Domain;
    updatedAt: Int64;
  }

  type RemoteFile = {
    id: string;
    name: string;
    content_type: string;
    content_size: number;
    url: string;
  };

  type LocalFile = {
    path: string;
    name?: string;
    type?: string;
    text?: string;
  };

  type Note = {
    id: string;
    noteRevision: NoteRevision;
    attachments: RemoteFile[];
  };

  type NoteRevision = {
    revision: number;
    title: string;
    contentType: number;
    contentText: string;
    contentFiles: RemoteFile[];
  };

  type CreateNoteParams = {
    note_title: string;
    note_content: string;
    note_attachments?: LocalFile[];
  };

  type GetNoteParams = { id: string };
  type GetNoteResult = { note: Note };

  type UpdateNoteParams = Partial<
    Omit<CreateNoteParams, 'note_attachments'> & { note_attachments: (LocalFile | RemoteFile)[] }
  >;
  type UpdateNoteResult = { note: Note };

  type DeleteNoteParams = { id: string };
  type DeleteNoteResult = { note: {} };

  interface Notes {
    get(params: GetNoteParams): Promise<GetNoteResult>;
    update(source: Note, params: UpdateNoteParams): Promise<UpdateNoteResult>;
    delete(params: DeleteNoteParams): Promise<DeleteNoteResult>;
  }

  interface MentionUtil {
    readonly forAll: string;
    markup(user: { id: string; name: string } | string): string;
  }

  interface DirectAPI {
    notes: Notes;
    mention: MentionUtil;
  }
}

export = directJs;
export as namespace directJs;
