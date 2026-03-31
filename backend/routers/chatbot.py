from fastapi import APIRouter
from fastapi import APIRouter
from pydantic import BaseModel
# Logic is implemented inline below

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatMessage(BaseModel):
    message: str

@router.post("/")
def chat(payload: ChatMessage):
    msg = payload.message.lower()
    
    response = "Desculpe, não entendi. Tente perguntar sobre 'regar', 'sol' ou 'adubo'."
    
    if "regar" in msg or "água" in msg:
        response = "A rega depende da planta. Geralmente, verifique se o solo está seco antes de regar novamente. Suculentas precisam de menos água que samambaias."
    elif "sol" in msg or "luz" in msg:
        response = "A maioria das flores gosta de sol, mas plantas de sombra como lírios da paz preferem luz indireta."
    elif "adubo" in msg or "fertilizante" in msg:
        response = "Recomendamos adubos orgânicos como húmus de minhoca a cada 3 meses."
    elif "bonsai" in msg:
        response = "Bonsais precisam de cuidados especiais com poda e rega frequente. Mantenha em local iluminado."
        
    return {"response": response}
