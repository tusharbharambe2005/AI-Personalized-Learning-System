"""
Learning app forms.
"""
from django import forms


class ContentSelectionForm(forms.Form):
    """Form for a student to select the most helpful content version."""
    content_version_id = forms.IntegerField(widget=forms.HiddenInput())
    rating = forms.ChoiceField(
        choices=[('', 'Skip rating'), ('1', '⭐'), ('2', '⭐⭐'), ('3', '⭐⭐⭐'), ('4', '⭐⭐⭐⭐'), ('5', '⭐⭐⭐⭐⭐')],
        required=False,
        widget=forms.Select(attrs={'class': 'form-select form-select-sm'})
    )
