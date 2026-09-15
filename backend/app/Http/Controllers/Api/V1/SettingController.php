<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SettingResource;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService,
    ) {}

    public function index(): JsonResponse
    {
        $settings = $this->settingsService->getAll();
        $keyValue = [];
        foreach ($settings as $setting) {
            $keyValue[$setting->key] = $setting->value;
        }

        return $this->success($keyValue);
    }

    public function update(Request $request): JsonResponse
    {
        $settings = $request->input('settings', $request->all());
        
        foreach ($settings as $key => $value) {
            $setting = \App\Models\Setting::where('key', $key)->first();
            if ($setting) {
                // Clear cache and update
                $this->settingsService->set($key, (string)$value);
            } else {
                $group = 'general';
                if (str_ends_with($key, '_url') || in_array($key, ['facebook', 'instagram', 'twitter', 'youtube'])) {
                    $group = 'social';
                }
                if (str_contains($key, 'razorpay') || str_contains($key, 'shiprocket')) {
                    $group = $key === 'cod_enabled' || $key === 'razorpay_enabled' ? 'payment' : 'shipping';
                }
                \App\Models\Setting::create([
                    'group' => $group,
                    'key' => $key,
                    'value' => (string)$value,
                    'type' => 'string',
                    'is_public' => false
                ]);
            }
        }

        return $this->success(null, 'Settings updated successfully');
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate(['logo' => 'required|image|max:2048']);

        $path = $request->file('logo')->store('settings', 'public');
        $url = Storage::disk('public')->url($path);

        $this->settingsService->set('app.logo', $url);

        return $this->success(['url' => $url], 'Logo uploaded successfully');
    }

    public function uploadFavicon(Request $request): JsonResponse
    {
        $request->validate(['favicon' => 'required|image|max:1024|mimes:ico,png']);

        $path = $request->file('favicon')->store('settings', 'public');
        $url = Storage::disk('public')->url($path);

        $this->settingsService->set('app.favicon', $url);

        return $this->success(['url' => $url], 'Favicon uploaded successfully');
    }

    public function public(Request $request): JsonResponse
    {
        $request->validate(['group' => 'required|string']);

        $settings = $this->settingsService->getByGroup($request->input('group'));

        return $this->success(SettingResource::collection($settings));
    }

    public function publicStorefront(): JsonResponse
    {
        $keyValue = [];
        foreach ($this->settingsService->getAll() as $setting) {
            if ($setting->is_public) {
                $keyValue[$setting->key] = $setting->value;
            }
        }

        return $this->success($keyValue);
    }
}
