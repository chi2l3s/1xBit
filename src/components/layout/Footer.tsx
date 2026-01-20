export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-gradient-dark">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">ООО «1xDrusha Entertainment»</p>
            <p className="text-xs text-muted-foreground">
              Официальная организация. Все документы, лицензии, регламенты и подписи находятся в публичном доступе.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Документы</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>Пользовательское соглашение</li>
              <li>Политика конфиденциальности</li>
              <li>AML/KYC</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Подписи</p>
            <p className="text-xs text-muted-foreground">
              Электронная подпись: <span className="font-mono">EDO-OK-2026</span>
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Все права защищены
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}


