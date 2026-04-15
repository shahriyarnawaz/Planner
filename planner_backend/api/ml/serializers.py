from rest_framework import serializers
from api.models import MLModelConfig, MLInferenceLog, MLErrorLog

class MLModelConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModelConfig
        fields = ['id', 'name', 'version', 'status', 'last_trained', 'temperature', 'max_suggestions']


class MLInferenceLogSerializer(serializers.ModelSerializer):
    model = serializers.CharField(source='model_config.name', read_only=True)
    
    class Meta:
        model = MLInferenceLog
        fields = ['id', 'model', 'input_data', 'output_data', 'confidence_score', 'timestamp']


class MLErrorLogSerializer(serializers.ModelSerializer):
    model = serializers.CharField(source='model_config.name', read_only=True)
    
    class Meta:
        model = MLErrorLog
        fields = ['id', 'model', 'error_message', 'timestamp']
