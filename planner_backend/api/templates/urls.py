from django.urls import path

from .views import (
    GlobalTemplateListView,
    TemplateSaveView,
    TemplateCategoryDetailView,
    TemplateCategoryListCreateView,
    TemplateListCreateView,
    TemplateUpdateView,
)


urlpatterns = [
    path('templates', TemplateListCreateView.as_view(), name='template-list-create'),
    path('templates/<int:pk>', TemplateUpdateView.as_view(), name='template-update'),
    path('templates/<int:template_id>/save', TemplateSaveView.as_view(), name='template-save'),
    path('templates/global', GlobalTemplateListView.as_view(), name='template-global-list'),
    path('template-categories', TemplateCategoryListCreateView.as_view(), name='template-category-list-create'),
    path('template-categories/<int:pk>', TemplateCategoryDetailView.as_view(), name='template-category-detail'),
]
