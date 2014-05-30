webtalk
=====
Work in progress:
Record-less, character-by-character chat

This node.js application will allow two users to chat with each other in real time, like in the old Unix application, Talk.
It is also built to be record-less; the server simply routes the characters in real time, never writes anything to disk, and keeps as little in memory as possible. This both makes the application more secure and the chats more spontaneous, and saves processing power.
