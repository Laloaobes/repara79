<?php

namespace App\Support;

final class DecimalMoney
{
    public static function toCents(string|int|float $amount): int
    {
        $normalized = trim((string) $amount);

        if (! preg_match('/^(-?)(\d+)(?:\.(\d{1,2}))?$/', $normalized, $matches)) {
            $normalized = number_format((float) $amount, 2, '.', '');
            preg_match('/^(-?)(\d+)\.(\d{2})$/', $normalized, $matches);
        }

        $sign = ($matches[1] ?? '') === '-' ? -1 : 1;
        $whole = (int) ($matches[2] ?? 0);
        $fraction = (int) str_pad($matches[3] ?? '', 2, '0');

        return $sign * (($whole * 100) + $fraction);
    }

    public static function multiplyToCents(int $quantity, string|int|float $unitCost): int
    {
        return $quantity * self::toCents($unitCost);
    }

    public static function formatCents(int $cents): string
    {
        $sign = $cents < 0 ? '-' : '';
        $absolute = abs($cents);

        return sprintf('%s%d.%02d', $sign, intdiv($absolute, 100), $absolute % 100);
    }

    public static function format(string|int|float $amount): string
    {
        return self::formatCents(self::toCents($amount));
    }
}
