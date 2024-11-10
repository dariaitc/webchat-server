const axios = require('axios');

// Function to get messages from a room within the last 5 seconds
// async function getLast5SecMessages(roomId) {
//     try {
//         const now = new Date().toISOString();
//         const fiveSecAgo = new Date(Date.now() - 5000).toISOString();

//         const response = await axios.get(//https://webexapis.com/v1/messages?roomId=Y2lzY29zcGFyazovL3VybjpURUFNOmV1LWNlbnRyYWwtMV9rL1JPT00vMjhkNTA0ZTAtYTMzNC0xMWVlLWE5MTEtNzU5OGIyYTg5ZmY0
//             `https://webexapis.com/v1/messages?roomId=${roomId}`,//&max=100
//             {
//                 headers: {
//                     Authorization: `Bearer NGYxN2E1M2YtNDNiMC00ZTlmLTliMzktOGM4OGY4ODg2MjBmNDc4ODVjOWMtYmEy_PE93_c208dd4d-669a-4028-a1b2-8fc48ffaa896`,
//                 },
//             }
//         );
//             console.log(response.data.items.filter((item)=>!item.roomType==='direct'))
//         const messages = response.data.items.filter(
//             (message) => message.created >= fiveSecAgo && message.created <= now
//         );

//         return messages;
//     } catch (error) {
//         console.error('Error getting messages:', error.message);
//         return [];
//     }
// }

// Function to get all rooms the bot is part of
// async function getBotRooms() {
//     try {
//         const response = await axios.get('https://webexapis.com/v1/rooms', {
//             headers: {
//                 Authorization: `Bearer NGYxN2E1M2YtNDNiMC00ZTlmLTliMzktOGM4OGY4ODg2MjBmNDc4ODVjOWMtYmEy_PE93_c208dd4d-669a-4028-a1b2-8fc48ffaa896`,
//             },
//         });

//         const rooms = response.data.items.map((room) => room.id);
//         return rooms;
//     } catch (error) {
//         console.error('Error getting rooms:', error.message);
//         return [];
//     }
// }

// Function to process messages from all rooms
// exports.processAllRoomsMessages = async() => {
//     try {
//         const roomIds = await getBotRooms();

//         for (const roomId of roomIds) {
//             const messages = await getLast5SecMessages(roomId);
//             console.log(`Messages in room ${roomId} within the last 5 seconds:`, messages);
//             // Process messages here
//         }
//     } catch (error) {
//         console.error('Error processing rooms:', error.message);
//     }
// }

