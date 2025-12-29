document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const imageUrl = document.getElementById('imageUrl');
    const copyBtn = document.getElementById('copyBtn');
    const statusDiv = document.getElementById('status');

    // Drag and drop functionality
    dropArea.addEventListener('click', () => fileInput.click());
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#764ba2';
        dropArea.style.background = '#e6e9ff';
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = '#667eea';
        dropArea.style.background = '#f8f9ff';
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#667eea';
        dropArea.style.background = '#f8f9ff';
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            uploadFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            uploadFile(e.target.files[0]);
        }
    });

    // Cloudinary upload function
    async function uploadFile(file) {
        // Show progress bar
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        previewContainer.style.display = 'none';
        
        // Validate file
        if (!file.type.match('image.*')) {
            showStatus('Please select an image file (JPEG, PNG, etc.)', 'error');
            progressContainer.style.display = 'none';
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showStatus('File size exceeds 10MB limit', 'error');
            progressContainer.style.display = 'none';
            return;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default'); // Change to your upload preset
        
        // IMPORTANT: For production, use a server-side API route instead of direct upload
        // This example shows client-side upload with unsigned preset
        
        try {
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += 10;
                    progressBar.style.width = progress + '%';
                    progressText.textContent = progress + '%';
                }
            }, 300);
            
            // Upload to Cloudinary
            const cloudName = 'YOUR_CLOUD_NAME'; // Will be replaced with env variable
            const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });
            
            clearInterval(progressInterval);
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Complete progress
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            
            // Show preview
            setTimeout(() => {
                progressContainer.style.display = 'none';
                showPreview(data);
                showStatus('Image uploaded successfully!', 'success');
            }, 500);
            
        } catch (error) {
            console.error('Upload error:', error);
            progressContainer.style.display = 'none';
            showStatus(`Upload failed: ${error.message}`, 'error');
        }
    }
    
    function showPreview(data) {
        imagePreview.innerHTML = `<img src="${data.secure_url}" alt="Uploaded Image">`;
        imageUrl.value = data.secure_url;
        previewContainer.style.display = 'block';
    }
    
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }
    
    // Copy URL functionality
    copyBtn.addEventListener('click', () => {
        imageUrl.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
        }, 2000);
    });
});
