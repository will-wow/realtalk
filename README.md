webtalk
=====
Character-by-character chat

Plan:
----
One room for all pending users
send chat request by username (these can stack, and expire in 30 secs)
if accepted, create room by id of requestor
add requested person
remove both from pending list
relay chars
on disconnect, ask other user if they want to go back to the lobby

