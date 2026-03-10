import torch
import torch.nn as nn  # Это строка, которую нужно добавить
from torch.utils.data import DataLoader
from torchvision import transforms, datasets
from model import Generator
import torch.optim as optim
from tqdm import tqdm
from torchvision.utils import save_image
import os

# Конфигурация
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
image_size = 64
batch_size = 64
lr = 0.0002
epochs = 50
latent_dim = 100

# Подготовка данных
transform = transforms.Compose([
    transforms.Resize(128),
    transforms.RandomCrop(64),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

os.makedirs("../outputs/train_samples", exist_ok=True)
dataset = datasets.ImageFolder(root="./flower-generator/test-data/", transform=transform)
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

# Инициализация
generator = Generator().to(device)
optimizer = optim.Adam(generator.parameters(), lr=lr, betas=(0.5, 0.999))
criterion = nn.L1Loss()

scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, 
    mode='min', 
    factor=0.5, 
    patience=10,
)

# Обучение
for epoch in range(epochs):
    progress_bar = tqdm(dataloader, desc=f"Epoch {epoch+1}/{epochs}")
    
    for i, (real_images, _) in enumerate(progress_bar):
        real_images = real_images.to(device)
    
        # Генерация - создаем шум с размером БАТЧА, а не фиксированным batch_size
        noise = torch.randn(real_images.size(0), latent_dim, device=device)  # Исправлено здесь
        fake_images = generator(noise)
    
        # Потери
        loss = criterion(fake_images, real_images)
    
        # Обновление
        optimizer.zero_grad()
        loss.backward()
        scheduler.step(loss)
        optimizer.step()
        
        progress_bar.set_postfix(loss=loss.item())

        with torch.no_grad():
            test_noise = torch.randn(8, latent_dim, device=device)
            generated = generator(test_noise)
            save_image(generated*0.5+0.5, f"../outputs/train_samples/epoch_{epoch}_batch_{i}.png")

    # Сохранение модели
    if (epoch+1) % 10 == 0:
        os.makedirs("../outputs/models", exist_ok=True)
        torch.save(generator.state_dict(), f"../outputs/models/generator_epoch_{epoch+1}.pth")
