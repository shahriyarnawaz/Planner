from django.urls import path

from .views import TemplateListCreateView, TemplateUpdateView


urlpatterns = [
    path('templates', TemplateListCreateView.as_view(), name='template-list-create'),
    path('templates/<int:pk>', TemplateUpdateView.as_view(), name='template-update'),
]
