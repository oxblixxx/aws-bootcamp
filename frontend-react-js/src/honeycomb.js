import { Honeycomb } from 'honeycomb-beeline';

Honeycomb({
  writeKey: process.env.HONEYCOMB_API_KEY,
  dataset: process.env.HONEYCOMB_DATASET,
  serviceName: 'my-frontend-app'
});

function startRequestTrace(url, method) {
  const span = Honeycomb.startTrace({
    name: `${method} ${url}`,
    'http.url': url,
    'http.method': method
  });

  return span;
}

function finishRequestTrace(span, error) {
  if (error) {
    Honeycomb.finishTrace(span, { error });
  } else {
    Honeycomb.finishTrace(span);
  }
}

export {
  startRequestTrace,
  finishRequestTrace
};
