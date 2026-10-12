using System.Security.Cryptography;
using System.Text;

namespace EmployeeAPI.Helpers
{
    public static class EncryptionHelper
    {
        private static string? _key;

        // Program.cs se ek baar call hoga — key load karega
        public static void Init(IConfiguration config)
        {
            _key = config["EncryptionSettings:Key"]
                   ?? throw new InvalidOperationException("EncryptionSettings:Key missing in appsettings.json");
        }

        // int → URL-safe encrypted string (e.g. "xY9zAq7Lp")
        public static string Encrypt(int id)
        {
            var plainBytes = Encoding.UTF8.GetBytes(id.ToString());

            using var aes = Aes.Create();
            aes.Key = SHA256.HashData(Encoding.UTF8.GetBytes(_key!));
            aes.GenerateIV();

            using var ms = new MemoryStream();
            ms.Write(aes.IV, 0, aes.IV.Length);                 // IV pehle likho (decrypt ke liye chahiye)
            using (var cs = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write))
                cs.Write(plainBytes, 0, plainBytes.Length);

            // Base64 → URL-safe (+, /, = hatao warna URL tootte hain)
            return Convert.ToBase64String(ms.ToArray())
                .Replace("+", "-").Replace("/", "_").TrimEnd('=');
        }

        // encrypted string → int (galat string pe exception)
        public static int Decrypt(string encrypted)
        {
            try
            {
                // URL-safe Base64 wapas normal Base64 me
                var b64 = encrypted.Replace("-", "+").Replace("_", "/")
                          .PadRight(encrypted.Length + (4 - encrypted.Length % 4) % 4, '=');
                var full = Convert.FromBase64String(b64);

                using var aes = Aes.Create();
                aes.Key = SHA256.HashData(Encoding.UTF8.GetBytes(_key!));

                var iv = new byte[16];
                Array.Copy(full, 0, iv, 0, 16);
                aes.IV = iv;

                using var ms = new MemoryStream(full, 16, full.Length - 16);
                using var cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Read);
                using var sr = new StreamReader(cs);
                return int.Parse(sr.ReadToEnd());
            }
            catch
            {
                throw new FormatException("Invalid encrypted ID");
            }
        }
    }
}
