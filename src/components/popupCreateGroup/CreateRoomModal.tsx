import {useEffect, useRef, useState} from "react";
type FriendOption = {
    name: string;
    image: string;
}
export type CreateRoomInput = {
    name: string;
    avatar: File|null;
    memberNames: string[];
}
export type CreateRoomModal = {
    friends: FriendOption[];
    onClose: () => void;
    onConfirm: (data:CreateRoomInput) => void;
}
export default function CreateRoomModal({ friends, onClose, onConfirm }: CreateRoomModal) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [search, setSearch] = useState("");
    const [memberNames, setMemberNames] = useState<string[]>([]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }
        dialog.showModal();
        return () => dialog.close();
    },[])
    useEffect(() => {
        if (!avatar){
            setPreview("");
            return;
        }
        const imageUrl = URL.createObjectURL(avatar);
        setPreview(imageUrl);
        return () => URL.revokeObjectURL(imageUrl);
    },[avatar]);
    function toggleMember(friendName: string) {
        setMemberNames(previous => previous.includes(friendName)
        ? previous.filter(name => name !==friendName) : [...previous, friendName])
    }
    const filteredFriends = friends
        .filter(friends => friends.name.toLowerCase().includes(search.trim().toLowerCase()));
    return (
        <>
            <dialog
                ref={dialogRef}
                className="create-room-modal"
                aria-labelledby="create-room-title"
                onCancel={event => {
                    event.preventDefault()
                    onClose()
                }}
            >
                <form
                    className="create-room-form"
                    onSubmit={event => {
                        event.preventDefault()

                        const roomName = name.trim()
                        if (!roomName) return

                        onConfirm({name: roomName, avatar, memberNames})
                    }}
                >
                    <h2 id="create-room-title">Tạo nhóm</h2>

                    <label>
                        Tên nhóm
                        <input
                            type="text"
                            value={name}
                            onChange={event => setName(event.currentTarget.value)}
                            placeholder="Nhập tên nhóm"
                            required
                        />
                    </label>

                    <label>
                        Ảnh đại diện
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={event =>
                                setAvatar(event.currentTarget.files?.[0] ?? null)
                            }
                        />
                    </label>

                    {preview && (
                        <img
                            className="create-room-avatar"
                            src={preview}
                            alt="Ảnh đại diện nhóm đã chọn"
                        />
                    )}

                    <label>
                        Thêm bạn bè vào nhóm
                        <input
                            type="search"
                            value={search}
                            onChange={event => setSearch(event.currentTarget.value)}
                            placeholder="Tìm bạn bè"
                        />
                    </label>
                    <p>Đã chọn {memberNames.length} người</p>
                    <div className="create-room-friends">
                        {filteredFriends.map(friend => (
                            <label className="friend-option" key={friend.name}>
                                <input
                                    type="checkbox"
                                    checked={memberNames.includes(friend.name)}
                                    onChange={() => toggleMember(friend.name)}
                                />

                                <img src={friend.image} alt="" />

                                <span>{friend.name}</span>
                            </label>
                        ))}

                        {filteredFriends.length === 0 && (
                            <p>Không tìm thấy người phù hợp.</p>
                        )}
                    </div>

                    <footer>
                        <button type="button" onClick={onClose}>
                            Hủy
                        </button>
                        <button type="submit" disabled={!name.trim()}>
                            Tạo nhóm
                        </button>
                    </footer>
                </form>
            </dialog>
        </>
    )
}