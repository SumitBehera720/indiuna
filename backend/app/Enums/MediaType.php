<?php

namespace App\Enums;

enum MediaType: string
{
    case Image = 'image';
    case Video = 'video';
    case Document = 'document';

    public function label(): string
    {
        return match ($this) {
            self::Image => 'Image',
            self::Video => 'Video',
            self::Document => 'Document',
        };
    }

    public function allowedExtensions(): array
    {
        return match ($this) {
            self::Image => ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'],
            self::Video => ['mp4', 'webm', 'ogg', 'avi', 'mov'],
            self::Document => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'],
        };
    }
}
