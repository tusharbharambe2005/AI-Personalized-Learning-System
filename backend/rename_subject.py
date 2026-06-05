import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'personalized_learning.settings')
django.setup()

from learning.models import Subject, ContentVersion
from django.utils.text import slugify

def run():
    old_name = "Applied Machine Learning"
    new_name = "Advance Machine Learning"
    
    try:
        subject = Subject.objects.get(name=old_name)
    except Subject.DoesNotExist:
        print(f"Subject '{old_name}' not found.")
        return

    print(f"Found subject: {subject.name}. Renaming to '{new_name}'...")
    
    # Update subject
    subject.name = new_name
    subject.slug = slugify(new_name)
    subject.description = subject.description.replace(old_name, new_name)
    subject.save()
    
    # Update all content versions linked to this subject's topics
    content_versions = ContentVersion.objects.filter(topic__subject=subject)
    updated_count = 0
    for cv in content_versions:
        if old_name in cv.content:
            cv.content = cv.content.replace(old_name, new_name)
            cv.save()
            updated_count += 1
            
    print(f"Successfully renamed subject and updated {updated_count} content version cards!")

if __name__ == '__main__':
    run()
