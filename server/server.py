#!/usr/bin/env python

# pip install websockets asoncio
# WS server example

import asyncio
import websockets

PORT = 8765

async def hello(websocket, path):
    name = await websocket.recv()
    print(f"< {name}")

    greeting = f"Hello {name}!"

    await websocket.send(greeting)
    await websocket.send(greeting + "rofl")
    print(f"> {greeting}")

    if name == "close":
        exit(-1)

start_server = websockets.serve(hello, 'localhost', PORT)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
