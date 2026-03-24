from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .text_summarization import model
import fitz  
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def serverresponse(request):
    if request.method == "POST" and request.FILES.get("file"):
        pdf_file = request.FILES.get("file")
        doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        answer = model(text) 
        return JsonResponse({"text": answer})