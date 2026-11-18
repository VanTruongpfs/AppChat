import { useRef, useState } from 'react'
import type { CreateRoomInput } from '../components/popupCreateGroup/CreateRoomModal'
import { createRoom } from '../services/roomService'

export function useCreateRoom() {
    const [showCreateRoom, setShowCreateRoom] = useState(false)
    const creatingRoomRef = useRef(false)

    const handleCreateRoom = async (data: CreateRoomInput) => {
        if (creatingRoomRef.current) return
        creatingRoomRef.current = true
        try {
            const room = await createRoom(data.name)
            console.log("Tạo phòng thành công:", room)
            setShowCreateRoom(false)
        } catch (error) {
            console.error("Tạo phòng thất bại:", error)
        } finally {
            creatingRoomRef.current = false
        }
    }

    return { showCreateRoom, setShowCreateRoom, handleCreateRoom }
}
