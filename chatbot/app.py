# chatbot/app.py (minimal for test)
import chainlit as cl

@cl.on_chat_start
async def main():
    await cl.Message(content="Hello! I'm your AI shopping assistant. How can I help you today?").send()

@cl.on_message
async def on_message(message: cl.Message):
    await cl.Message(content=f"You said: {message.content}").send()