export function DateToAgo(
  from: Date,
  isShort: boolean = false,
  prefix: boolean = false,
  to = new Date(Date.now()),
): string {
  const seconds = Math.floor(
    (new Date(to).getTime() - new Date(from).getTime()) / 1000,
  );

  let interval = seconds / 31536000;
  const textDate = prefix ? 'il y a ' : '';

  if (interval > 1) {
    const textPeriod = isShort
      ? ' a'
      : ' an' + (Math.floor(interval) > 1 ? 's' : '');
    return textDate + Math.floor(interval) + textPeriod;
  } else {
    interval = seconds / 2592000;
    if (interval > 1) {
      const textPeriod = isShort ? ' mois' : ' mois';
      return textDate + Math.floor(interval) + textPeriod;
    } else {
      interval = seconds / 86400;
      if (interval > 1) {
        const textPeriod = isShort
          ? ' j'
          : ' jour' + (Math.floor(interval) > 1 ? 's' : '');
        return textDate + Math.floor(interval) + textPeriod;
      } else {
        interval = seconds / 3600;
        if (interval > 1) {
          const textPeriod = isShort
            ? ' h'
            : ' heure' + (Math.floor(interval) > 1 ? 's' : '');
          return textDate + Math.floor(interval) + textPeriod;
        } else {
          interval = seconds / 60;
          if (interval > 1) {
            const textPeriod = isShort
              ? ' min'
              : ' minute' + (Math.floor(interval) > 1 ? 's' : '');
            return textDate + Math.floor(interval) + textPeriod;
          } else {
            const textPeriod = isShort
              ? ' s'
              : ' seconde' + (Math.floor(interval) > 1 ? 's' : '');
            return textDate + Math.floor(interval) + textPeriod;
          }
        }
      }
    }
  }
}
